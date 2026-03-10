// API endpoint pre duplikovanie lekcií medzi školeniami (iba pre superadmin)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZHN1b3h0d3huZWxsbHVpb3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODkxNzIsImV4cCI6MjA4MTI2NTE3Mn0.bQe3EsPxCpqSivyrggj3X52a3io7PYoi-0PWB5LBCvo';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Povoliť len POST requesty
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lesson_id, target_training_id } = req.body;
    
    // Overiť, či má užívateľ superadmin práva
    const { data: { user }, error: authError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Overiť, či je superadmin (podľa JWT claimu alebo user_metadata)
    const userRole = user?.user_metadata?.role;
    const userEmail = user?.email;
    
    if (userRole !== 'SUPER_ADMIN' && userEmail !== 'sluzby@lordsbenison.eu') {
      return res.status(403).json({ error: 'Insufficient permissions - super admin required' });
    }

    // Získať detaily lekcie, ktorú chceme duplikovať
    const { data: sourceLesson, error: sourceError } = await supabase
      .from('training_modules')
      .select('*')
      .eq('id', lesson_id)
      .single();

    if (sourceError || !sourceLesson) {
      return res.status(404).json({ error: 'Source lesson not found' });
    }

    // Overiť, či cieľové školenie existuje
    const { data: targetTraining, error: targetError } = await supabase
      .from('trainings')
      .select('id, title')
      .eq('id', target_training_id)
      .single();

    if (targetError || !targetTraining) {
      return res.status(404).json({ error: 'Target training not found' });
    }

    // Zistiť najvyššie order_index pre cieľové školenie
    const { data: existingModules, error: orderError } = await supabase
      .from('training_modules')
      .select('order_index')
      .eq('training_id', target_training_id)
      .order('order_index', { ascending: false })
      .limit(1);

    let nextOrderIndex = 1;
    if (!orderError && existingModules && existingModules.length > 0) {
      nextOrderIndex = existingModules[0].order_index + 1;
    }

    // Vytvoriť duplikát lekcie
    const { data: duplicatedLesson, error: duplicateError } = await supabase
      .from('training_modules')
      .insert({
        training_id: target_training_id,
        title: sourceLesson.title,
        content: sourceLesson.content,
        description: sourceLesson.description || null,
        module_type: sourceLesson.module_type,
        video_url: sourceLesson.video_url || null,
        quiz_questions: sourceLesson.quiz_questions || null,
        duration_minutes: sourceLesson.duration_minutes,
        is_mandatory: sourceLesson.is_mandatory,
        order_index: nextOrderIndex
      })
      .select()
      .single();

    if (duplicateError) {
      console.error('Duplicate lesson error:', duplicateError);
      return res.status(500).json({ error: 'Failed to duplicate lesson' });
    }

    return res.status(201).json({ 
      success: true, 
      duplicated_lesson: duplicatedLesson,
      message: `Lekcia "${sourceLesson.title}" bola úspešne duplikovaná do školenia "${targetTraining.title}"`
    });

  } catch (error) {
    console.error('Duplicate lesson API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
