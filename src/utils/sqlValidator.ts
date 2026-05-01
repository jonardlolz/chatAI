interface ValidationResult {
  valid: boolean;
  warnings?: string[];
}

class SQLValidator {
  validate(sql: string, databaseType: string): ValidationResult {
    const warnings: string[] = [];

    // Check for SQL injection patterns
    if (this.containsSuspiciousPatterns(sql)) {
      warnings.push('SQL contains potentially dangerous patterns');
    }

    // Check for parameterized queries
    const hasParameters = this.hasParameterPlaceholders(sql, databaseType);
    if (!hasParameters && !this.isSafeReadOnlyQuery(sql)) {
      warnings.push('Non-SELECT queries should use parameterized queries');
    }

    // Check for basic SQL syntax
    if (!this.hasValidSQLOperation(sql)) {
      return {
        valid: false,
        warnings: ['Invalid SQL operation']
      };
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  private containsSuspiciousPatterns(sql: string): boolean {
    const suspiciousPatterns = [
      /DROP\s+TABLE/i,
      /DROP\s+DATABASE/i,
      /TRUNCATE/i,
      /ALTER\s+TABLE/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(sql));
  }

  private hasParameterPlaceholders(sql: string, databaseType: string): boolean {
    switch (databaseType) {
      case 'postgresql':
        return /\$\d+/.test(sql);
      case 'mysql':
        return /\?/.test(sql);
      case 'sqlite':
        return /\?|:\w+/.test(sql);
      default:
        return /\?|\$\d+|:\w+/.test(sql);
    }
  }

  private isSafeReadOnlyQuery(sql: string): boolean {
    return /^\s*SELECT\s+/i.test(sql);
  }

  private hasValidSQLOperation(sql: string): boolean {
    const validOperations = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)/i;
    return validOperations.test(sql);
  }
}

export default new SQLValidator();
