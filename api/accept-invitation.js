// API endpoint pre prijatie pozvánky a registráciu
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
    const { email, companyToken } = req.body;
    
    if (!email || !companyToken) {
      return res.status(400).json({ error: 'Chýbajúce povinné údaje' });
    }

    // Aktualizovať stav pozvánky na ACCEPTED
    const { data: invitation, error: updateError } = await supabase
      .from('invitations')
      .update({ 
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim())
      .eq('company_token', companyToken)
      .eq('status', 'PENDING')
      .select()
      .single();

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return res.status(500).json({ error: 'Failed to update invitation' });
    }

    if (!invitation) {
      return res.status(404).json({ error: 'Pozvánka nebola nájdená alebo už bola prijatá' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Pozvánka prijatá',
      invitation 
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
