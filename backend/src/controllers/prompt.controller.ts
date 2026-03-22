import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';

export const getPrompts = async (req: AuthRequest, res: Response) => {
  const { category, care_type } = req.query;

  let queryStr = 'SELECT * FROM prompts WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;

  if (category) {
    queryStr += ` AND category = $${paramCount++}`;
    params.push(category);
  }

  if (care_type) {
    queryStr += ` AND (care_type = $${paramCount++} OR care_type IS NULL)`;
    params.push(care_type);
  }

  queryStr += ' ORDER BY category, created_at';

  const result = await query(queryStr, params);

  res.json({
    success: true,
    data: { prompts: result.rows },
  });
};

export const getPrompt = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('SELECT * FROM prompts WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({
      success: false,
      error: 'Prompt not found',
    });
    return;
  }

  res.json({
    success: true,
    data: { prompt: result.rows[0] },
  });
};
