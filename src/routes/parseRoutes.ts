import { Router, Request, Response } from 'express';
import parseController from '../controllers/parseController';

const router = Router();

/**
 * POST /api/parse
 * Convert natural language prompt to SQL
 */
const handleParseRequest = async (req: Request, res: Response) => {
  try {
    const result = await parseController.parsePrompt(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

router.post('/parse', handleParseRequest);
router.post('/products/ai/parse', handleParseRequest);

export default router;
