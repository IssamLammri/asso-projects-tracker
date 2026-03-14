import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

router.get('/projects', async (req, res, next) => {
  try {
    const supabase = getDb();
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;

    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('project_id, amount');
      
    if (collError) throw collError;

    const projectsWithTotals = projects.map(p => {
      const projectCollections = collections.filter(c => c.project_id === p.id);
      const total = projectCollections.reduce((sum, c) => sum + Number(c.amount), 0);
      return { ...p, total_collected: total };
    });

    res.json(projectsWithTotals);
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id', async (req, res, next) => {
  try {
    const supabase = getDb();
    const projectId = req.params.id;
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (error || !project) return res.status(404).json({ error: 'Project not found' });

    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });
      
    if (collError) throw collError;

    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
      
    if (docError) throw docError;

    const { data: updates, error: updError } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
      
    if (updError) throw updError;

    const total = collections.reduce((sum, c) => sum + Number(c.amount), 0);

    res.json({
      ...project,
      total_collected: total,
      collections,
      documents,
      updates
    });
  } catch (err) {
    next(err);
  }
});

export default router;
