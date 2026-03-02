
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZHN1b3h0d3huZWxsbHVpb3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODkxNzIsImV4cCI6MjA4MTI2NTE3Mn0.bQe3EsPxCpqSivyrggj3X52a3io7PYoi-0PWB5LBCvo';

export const supabase = createClient(supabaseUrl, supabaseKey);

const sanitizeFilename = (name: string) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z0-9.]/g, "_")  
    .toLowerCase();
};

/**
 * ZÍSKANIE ZAMESTNANCOV PRE FIRMU / ADMINA
 */
export const getEmployees = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { data: [], error: "No session" };

    const user = session.user;
    
    // 1. SuperAdmin bypass
    if (user.email === 'sluzby@lordsbenison.eu' || user.user_metadata?.role === 'SUPER_ADMIN') {
      return await supabase.from('employees').select('*').order('full_name', { ascending: true });
    }

    // 2. Skúsime získať token priamo z DB (bezpečne)
    const { data: myProfile } = await supabase
      .from('employees')
      .select('company_token')
      .eq('id', user.id)
      .maybeSingle();

    const token = myProfile?.company_token || user.user_metadata?.company_token || user.user_metadata?.token;

    if (!token) return { data: [], error: "No token" };

    // 3. Načítame tím
    return await supabase
      .from('employees')
      .select('*')
      .eq('company_token', token)
      .neq('id', user.id)
      .order('full_name', { ascending: true });

  } catch (err: any) {
    console.error("getEmployees error:", err);
    return { data: [], error: err.message };
  }
};

export const uploadAndAssignIP = async (file: File, title: string, employeeIds: string[]) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Chýba prihlásenie.");

  const userId = session.user.id;
  const safeName = sanitizeFilename(file.name);
  const fileName = `${Date.now()}_${safeName}`;
  
  const { error: storageError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (storageError) throw new Error(`Súbor sa nepodarilo nahrať: ${storageError.message}`);

  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);

  const { data: docData, error: docError } = await supabase
    .from('documents')
    .insert({
      title: title,
      file_path: fileName,
      file_url: publicUrl,
      company_id: userId
    })
    .select()
    .single();

  if (docError) {
    await supabase.storage.from('documents').remove([fileName]);
    throw new Error(`Chyba databázy (dokument): ${docError.message}`);
  }

  const assignments = employeeIds.map(empId => ({
    document_id: docData.id,
    employee_id: empId,
    status: 'PENDING'
  }));

  const { error: assignError } = await supabase
    .from('assigned_documents')
    .insert(assignments);

  if (assignError) throw new Error(`Chyba pri priraďovaní: ${assignError.message}`);

  return { success: true };
};

export const getMyDocuments = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { data: [], error: 'No session' };

  return await supabase
    .from('assigned_documents')
    .select(`
      id,
      status,
      signed_at,
      viewed_at,
      document:document_id ( id, title, file_url, created_at )
    `)
    .eq('employee_id', session.user.id);
};

export const getAllAssignments = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: [], error: "No session" };

  const userId = session.user.id;

  return await supabase
    .from('assigned_documents')
    .select(`
      id,
      status,
      viewed_at,
      signed_at,
      created_at,
      employee_id,
      document:document_id!inner ( id, title, company_id ),
      employee:employee_id ( id, full_name, email )
    `)
    .eq('document.company_id', userId) 
    .order('created_at', { ascending: false });
};

export const markAsViewed = async (assignmentId: string) => {
  return await supabase
    .from('assigned_documents')
    .update({ viewed_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .is('viewed_at', null);
};

export const signDocument = async (assignmentId: string) => {
  return await supabase
    .from('assigned_documents')
    .update({ 
      status: 'SIGNED', 
      signed_at: new Date().toISOString() 
    })
    .eq('id', assignmentId);
};

export const getTrainings = async () => {
  return await supabase
    .from('trainings')
    .select('*')
    .order('created_at', { ascending: false });
};

export const getPublishedTrainings = async () => {
  return await supabase
    .from('trainings')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
};

export const createTraining = async (trainingData: any) => {
  return await supabase
    .from('trainings')
    .insert(trainingData)
    .select()
    .single();
};

export const updateTraining = async (id: string, trainingData: any) => {
  return await supabase
    .from('trainings')
    .update(trainingData)
    .eq('id', id);
};

export const getTrainingModules = async (trainingId: string) => {
  return await supabase
    .from('training_modules')
    .select('*')
    .eq('training_id', trainingId)
    .order('order_index', { ascending: true });
};

export const createTrainingModules = async (modules: any[]) => {
  return await supabase
    .from('training_modules')
    .upsert(modules, { onConflict: 'id' });
};

export const purchaseTraining = async (purchaseData: any) => {
  return await supabase
    .from('company_purchases')
    .insert(purchaseData)
    .select()
    .single();
};

export const getCompanyPurchases = async (companyId: string) => {
  return await supabase
    .from('company_purchases')
    .select(`
      *,
      training:trainings(*)
    `)
    .eq('company_id', companyId)
    .order('purchase_date', { ascending: false });
};

export const assignTrainingToEmployees = async (assignments: any[]) => {
  return await supabase
    .from('employee_trainings')
    .insert(assignments);
};

export const getTrainingContent = async (trainingId: string, companyId?: string) => {
  const { data: training, error: tError } = await supabase
    .from('trainings')
    .select('*')
    .eq('id', trainingId)
    .single();

  if (tError) throw tError;

  const { data: modules, error: mError } = await supabase
    .from('training_modules')
    .select('*')
    .eq('training_id', trainingId)
    .order('order_index', { ascending: true });

  if (mError) throw mError;

  return { 
    training, 
    modules: modules || [], 
    isDemo: !companyId 
  };
};

export const updateTrainingProgress = async (assignmentId: string, progress: number, completed: boolean) => {
  const update: any = { progress_percentage: progress };
  if (completed) {
    update.status = 'completed';
    update.completed_at = new Date().toISOString();
  } else if (progress > 0) {
    update.status = 'in_progress';
  }
  
  return await supabase
    .from('employee_trainings')
    .update(update)
    .eq('id', assignmentId);
};

export const updateEmployeeStatus = async (employeeId: string, status: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authenticated session");
  
  return await supabase
    .from('employees')
    .update({ status })
    .eq('id', employeeId);
};

export const deleteEmployee = async (employeeId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authenticated session");
  
  return await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);
};
