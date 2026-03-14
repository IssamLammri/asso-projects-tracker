import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://supabase.ccib38.fr';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzczMjM4OTM0LCJleHAiOjE5MzA5MTg5MzR9.psYSD_-W2b-b6eW1jPXB2gR7cRkQ9lfJ_bGuWaqX2jA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'collect_project'
  }
});

export function initDb() {
  // Supabase doesn't need initialization like SQLite
  console.log('Supabase client initialized with schema: collect_project');
}

export function getDb() {
  return supabase;
}
