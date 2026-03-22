import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { AppError } from '../middleware/errorHandler';
import { CreateQuestionInput, UpdateQuestionInput } from '../validators/question.validator';

export const createQuestion = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const data: CreateQuestionInput = req.body;

  // Verify resident exists
  const resident = await query('SELECT id FROM residents WHERE id = $1', [data.resident_id]);
  if (resident.rows.length === 0) {
    throw new AppError('Resident not found', 404);
  }

  // Only family members can ask questions
  if (req.user.role !== 'family') {
    throw new AppError('Only family members can ask questions', 403);
  }

  // Verify family connection
  const connection = await query(
    'SELECT id FROM family_connections WHERE resident_id = $1 AND user_id = $2 AND invite_status = $3',
    [data.resident_id, req.user.id, 'ACTIVE']
  );

  if (connection.rows.length === 0) {
    throw new AppError('You are not connected to this resident', 403);
  }

  const result = await query(
    `INSERT INTO questions (resident_id, asked_by_user_id, question_text, notify_all_family)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.resident_id, req.user.id, data.question_text, data.notify_all_family]
  );

  // TODO: Trigger notification to resident

  res.status(201).json({
    success: true,
    data: { question: result.rows[0] },
  });
};

export const getQuestions = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { resident_id, status } = req.query;

  let result;
  if (req.user.role === 'resident') {
    // Resident sees questions for their profile
    const resident = await query('SELECT id FROM residents WHERE user_id = $1', [req.user.id]);
    if (resident.rows.length === 0) {
      res.json({ success: true, data: { questions: [] } });
      return;
    }

    let queryStr = `
      SELECT q.*, u.name as asked_by_name, s.id as answered_story_id, s.title as answered_story_title
      FROM questions q
      JOIN users u ON q.asked_by_user_id = u.id
      LEFT JOIN stories s ON q.answered_story_id = s.id
      WHERE q.resident_id = $1
    `;
    const params: any[] = [resident.rows[0].id];

    if (status) {
      queryStr += ' AND q.status = $2';
      params.push(status);
    }

    queryStr += ' ORDER BY q.created_at DESC';
    result = await query(queryStr, params);
  } else if (req.user.role === 'family') {
    // Family sees questions they asked
    let queryStr = `
      SELECT q.*, r.name as resident_name, s.id as answered_story_id, s.title as answered_story_title
      FROM questions q
      JOIN residents r ON q.resident_id = r.id
      LEFT JOIN stories s ON q.answered_story_id = s.id
      WHERE q.asked_by_user_id = $1
    `;
    const params: any[] = [req.user.id];

    if (resident_id) {
      queryStr += ' AND q.resident_id = $2';
      params.push(resident_id);
    }

    if (status) {
      queryStr += ` AND q.status = $${params.length + 1}`;
      params.push(status);
    }

    queryStr += ' ORDER BY q.created_at DESC';
    result = await query(queryStr, params);
  } else if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
    // Staff/Facility Admin/Platform Admin see questions from their organization
    let queryStr = `
      SELECT q.*, r.name as resident_name, u.name as asked_by_name, s.id as answered_story_id, s.title as answered_story_title
      FROM questions q
      JOIN residents r ON q.resident_id = r.id
      JOIN users u ON q.asked_by_user_id = u.id
      LEFT JOIN stories s ON q.answered_story_id = s.id
      WHERE r.organization_id = $1
    `;
    const params: any[] = [req.user.organization_id];

    if (resident_id) {
      queryStr += ' AND q.resident_id = $2';
      params.push(resident_id);
    }

    if (status) {
      queryStr += ` AND q.status = $${params.length + 1}`;
      params.push(status);
    }

    queryStr += ' ORDER BY q.created_at DESC';
    result = await query(queryStr, params);
  } else {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: { questions: result.rows },
  });
};

export const getQuestion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    `SELECT q.*, r.name as resident_name, r.organization_id, u.name as asked_by_name, s.title as answered_story_title
     FROM questions q
     JOIN residents r ON q.resident_id = r.id
     JOIN users u ON q.asked_by_user_id = u.id
     LEFT JOIN stories s ON q.answered_story_id = s.id
     WHERE q.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Question not found', 404);
  }

  const question = result.rows[0];

  // RLS: Check access
  if (req.user) {
    if (req.user.role === 'resident') {
      const resident = await query('SELECT id FROM residents WHERE user_id = $1', [req.user.id]);
      if (resident.rows.length === 0 || resident.rows[0].id !== question.resident_id) {
        throw new AppError('Access denied', 403);
      }
    } else if (req.user.role === 'family') {
      if (req.user.id !== question.asked_by_user_id) {
        throw new AppError('Access denied', 403);
      }
    } else if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
      // Check if question's resident belongs to user's organization
      const resident = await query('SELECT organization_id FROM residents WHERE id = $1', [question.resident_id]);
      if (resident.rows.length === 0 || resident.rows[0].organization_id !== req.user.organization_id) {
        throw new AppError('Access denied', 403);
      }
    }
  }

  res.json({
    success: true,
    data: { question },
  });
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data: UpdateQuestionInput = req.body;

  // Only resident, staff, or facility_admin can update (mark as answered)
  if (req.user && req.user.role !== 'resident' && req.user.role !== 'staff' && req.user.role !== 'facility_admin' && req.user.role !== 'platform_admin') {
    throw new AppError('Access denied', 403);
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.status) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  if (data.answered_story_id) {
    updates.push(`answered_story_id = $${paramCount++}`);
    values.push(data.answered_story_id);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);
  const result = await query(
    `UPDATE questions SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('Question not found', 404);
  }

  // TODO: If status changed to ANSWERED, trigger notification

  res.json({
    success: true,
    data: { question: result.rows[0] },
  });
};
