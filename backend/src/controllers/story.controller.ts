import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { AppError } from '../middleware/errorHandler';
import { CreateStoryInput, UpdateStoryInput } from '../validators/story.validator';

export const createStory = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const data: CreateStoryInput = req.body;

  // Verify resident exists and check consent
  const resident = await query(
    'SELECT id, consent_status, organization_id FROM residents WHERE id = $1',
    [data.resident_id]
  );

  if (resident.rows.length === 0) {
    throw new AppError('Resident not found', 404);
  }

  if (resident.rows[0].consent_status !== 'CONFIRMED') {
    throw new AppError('Resident consent not confirmed', 400);
  }

  // RLS: Check access
  if (req.user.role === 'resident' && req.user.id !== resident.rows[0].user_id) {
    throw new AppError('Access denied', 403);
  }

  if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
    if (req.user.organization_id !== resident.rows[0].organization_id) {
      throw new AppError('Access denied', 403);
    }
  }

  const result = await query(
    `INSERT INTO stories (resident_id, title, video_url, prompt_id, question_id, privacy, duration_seconds, staff_recorded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.resident_id,
      data.title || null,
      data.video_url,
      data.prompt_id || null,
      data.question_id || null,
      data.privacy,
      data.duration_seconds || null,
      (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') ? req.user.id : null,
    ]
  );

  const story = result.rows[0];

  // If story answers a question, update question status
  if (data.question_id) {
    await query(
      `UPDATE questions 
       SET status = 'ANSWERED', answered_story_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [story.id, data.question_id]
    );

    // TODO: Trigger notification email here
  }

  // TODO: Trigger notification to family members

  res.status(201).json({
    success: true,
    data: { story },
  });
};

export const getStories = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { resident_id } = req.query;

  let result;
  if (req.user.role === 'resident') {
    // Resident sees their own stories
    const resident = await query('SELECT id FROM residents WHERE user_id = $1', [req.user.id]);
    if (resident.rows.length === 0) {
      res.json({ success: true, data: { stories: [] } });
      return;
    }
    result = await query(
      `SELECT s.*, p.text as prompt_text, q.question_text
       FROM stories s
       LEFT JOIN prompts p ON s.prompt_id = p.id
       LEFT JOIN questions q ON s.question_id = q.id
       WHERE s.resident_id = $1
       ORDER BY s.created_at DESC`,
      [resident.rows[0].id]
    );
  } else if (req.user.role === 'family') {
    // Family sees stories they have access to
    const connections = await query(
      'SELECT resident_id FROM family_connections WHERE user_id = $1 AND invite_status = $2',
      [req.user.id, 'ACTIVE']
    );
    const residentIds = connections.rows.map(c => c.resident_id);

    if (residentIds.length === 0) {
      res.json({ success: true, data: { stories: [] } });
      return;
    }

    result = await query(
      `SELECT s.*, p.text as prompt_text, q.question_text, r.name as resident_name
       FROM stories s
       JOIN residents r ON s.resident_id = r.id
       LEFT JOIN prompts p ON s.prompt_id = p.id
       LEFT JOIN questions q ON s.question_id = q.id
       WHERE s.resident_id = ANY($1::uuid[])
       AND s.privacy != 'PRIVATE'
       ORDER BY s.created_at DESC`,
      [residentIds]
    );
  } else if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
    // Staff/Facility Admin/Platform Admin see stories from their organization
    let queryStr = `
      SELECT s.*, p.text as prompt_text, q.question_text, r.name as resident_name
      FROM stories s
      JOIN residents r ON s.resident_id = r.id
      LEFT JOIN prompts p ON s.prompt_id = p.id
      LEFT JOIN questions q ON s.question_id = q.id
      WHERE r.organization_id = $1
    `;
    const params: any[] = [req.user.organization_id];

    if (resident_id) {
      queryStr += ' AND s.resident_id = $2';
      params.push(resident_id);
    }

    queryStr += ' ORDER BY s.created_at DESC';
    result = await query(queryStr, params);
  } else {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: { stories: result.rows },
  });
};

export const getStory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    `SELECT s.*, r.name as resident_name, r.organization_id, p.text as prompt_text, q.question_text
     FROM stories s
     JOIN residents r ON s.resident_id = r.id
     LEFT JOIN prompts p ON s.prompt_id = p.id
     LEFT JOIN questions q ON s.question_id = q.id
     WHERE s.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Story not found', 404);
  }

  const story = result.rows[0];

  // RLS: Check access
  if (req.user) {
    if (req.user.role === 'family') {
      const connection = await query(
        'SELECT id FROM family_connections WHERE resident_id = $1 AND user_id = $2 AND invite_status = $3',
        [story.resident_id, req.user.id, 'ACTIVE']
      );
      if (connection.rows.length === 0 || story.privacy === 'PRIVATE') {
        throw new AppError('Access denied', 403);
      }
    } else if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
      if (req.user.organization_id !== story.organization_id) {
        throw new AppError('Access denied', 403);
      }
    }
  }

  res.json({
    success: true,
    data: { story },
  });
};

export const updateStory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data: UpdateStoryInput = req.body;

  // Check access
  const story = await query(
    'SELECT resident_id FROM stories WHERE id = $1',
    [id]
  );

  if (story.rows.length === 0) {
    throw new AppError('Story not found', 404);
  }

  // Only resident or staff/facility_admin can update
  if (req.user && req.user.role !== 'staff' && req.user.role !== 'facility_admin' && req.user.role !== 'platform_admin') {
    const resident = await query('SELECT user_id FROM residents WHERE id = $1', [story.rows[0].resident_id]);
    if (resident.rows[0].user_id !== req.user.id) {
      throw new AppError('Access denied', 403);
    }
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.privacy) {
    updates.push(`privacy = $${paramCount++}`);
    values.push(data.privacy);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);
  const result = await query(
    `UPDATE stories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  res.json({
    success: true,
    data: { story: result.rows[0] },
  });
};
