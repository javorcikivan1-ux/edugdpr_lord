// API endpoint pre pridávanie zamestnancov cez aplikáciu
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
    const { name, email, position, company_token } = req.body;
    
    // Overiť, či má užívateľ práva
    const { data: { user }, error: authError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Overiť, či je admin alebo má správny company_token
    const { data: employee } = await supabase
      .from('employees')
      .select('company_token, role')
      .eq('user_id', user.id)
      .single();

    if (!employee || employee.role !== 'ADMIN_ROOT') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Overiť, či company_token zodpovedá
    if (employee.company_token !== company_token) {
      return res.status(403).json({ error: 'Invalid company token' });
    }

    // Vytvoriť nového zamestnanca
    const { data: newEmployee, error: insertError } = await supabase
      .from('employees')
      .insert({
        name,
        email,
        position,
        company_token,
        status: 'ACTIVE',
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create employee' });
    }

    return res.status(201).json({ 
      success: true, 
      employee: newEmployee 
    });

  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(500).json({ error: error.message });
  }
}
