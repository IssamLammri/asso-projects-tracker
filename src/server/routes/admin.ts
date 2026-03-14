import express from 'express';
import path from 'path';
import multer from 'multer';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Use memory storage for Supabase uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authenticateToken);

async function uploadToSupabase(file: Express.Multer.File): Promise<string | null> {
  if (!file) return null;
  const supabase = getDb();
  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}${ext}`;
  
  const { data, error } = await supabase.storage
    .from('collect-project-uploads')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });
    
  if (error) {
    console.error('Supabase storage error:', error);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('collect-project-uploads')
    .getPublicUrl(filename);
    
  return publicUrlData.publicUrl;
}

// Projects
router.post('/projects', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, goal_amount, start_date } = req.body;
    const supabase = getDb();
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        { title, description, image: imageUrl, goal_amount, start_date }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

router.put('/projects/:id', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, goal_amount, start_date, status } = req.body;
    const projectId = req.params.id;
    const supabase = getDb();

    const updateData: any = { title, description, goal_amount, start_date, status };
    
    if (req.file) {
      updateData.image = await uploadToSupabase(req.file);
    }

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/projects/:id', async (req, res, next) => {
  try {
    const supabase = getDb();
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Collections
router.post('/collections', async (req, res, next) => {
  try {
    const { project_id, amount, date, description, source } = req.body;
    const supabase = getDb();
    
    const { data, error } = await supabase
      .from('collections')
      .insert([
        { project_id, amount, date, description, source }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

router.delete('/collections/:id', async (req, res, next) => {
  try {
    const supabase = getDb();
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Documents
router.post('/documents', upload.single('file'), async (req, res, next) => {
  try {
    const { project_id, description } = req.body;
    
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = await uploadToSupabase(req.file);
    const original_name = req.file.originalname;
    const type = req.file.mimetype;
    const supabase = getDb();

    const { data, error } = await supabase
      .from('documents')
      .insert([
        { project_id, filename: fileUrl, original_name, description, type }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

router.delete('/documents/:id', async (req, res, next) => {
  try {
    const supabase = getDb();
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Project Updates
router.post('/project-news', upload.single('attachment'), async (req, res, next) => {
  try {
    const { project_id, title, content } = req.body;
    const supabase = getDb();
    
    let attachment_path = null;
    let attachment_type = null;
    
    if (req.file) {
      attachment_path = await uploadToSupabase(req.file);
      attachment_type = req.file.mimetype;
    }

    const { data, error } = await supabase
      .from('project_updates')
      .insert([
        { project_id, title, content, attachment_path, attachment_type }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

router.delete('/project-news/:id', async (req, res, next) => {
  try {
    const supabase = getDb();
    const { error } = await supabase
      .from('project_updates')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
