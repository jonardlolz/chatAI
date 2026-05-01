import { Router, Request, Response } from 'express';
import parseController from '../controllers/parseController';

const router = Router();

/**
 * POST /api/parse
 * Convert natural language prompt to SQL
 */
router.post('/parse', async (req: Request, res: Response) => {
  try {
    const result = await parseController.parsePrompt(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
