
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZHN1b3h0d3huZWxsbHVpb3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODkxNzIsImV4cCI6MjA4MTI2NTE3Mn0.bQe3EsPxCpqSivyrggj3X52a3io7PYoi-0PWB5LBCvo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- ZAMESTNANCI ---
export const getEmployees = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: [], error: "Neprihlásený" };
  
  const { data: adminData } = await supabase.from('employees').select('company_token').eq('id', session.user.id).single();
  
  return await supabase
    .from('employees')
    .select('*')
    .eq('company_token', adminData?.company_token)
    .neq('id', session.user.id)
    .order('full_name', { ascending: true });
};

// --- ŠKOLENIA: CORE ---
export const getTrainings = async () => {
  return await supabase.from('trainings').select('*').order('created_at', { ascending: false });
};

export const getPublishedTrainings = async () => {
  return await supabase.from('trainings').select('*').eq('status', 'published').order('created_at', { ascending: false });
};

export const getFullTrainingData = async (trainingId: string) => {
  const training = await supabase.from('trainings').select('*').eq('id', trainingId).single();
  const modules = await supabase.from('training_modules').select('*').eq('training_id', trainingId).order('order_index', { ascending: true });
  return { training: training.data, modules: modules.data };
};

export const saveTrainingWithModules = async (training: any, modules: any[]) => {
  const { data: tData, error: tError } = await supabase.from('trainings').upsert(training).select().single();
  if (tError) throw tError;

  if (training.id) {
    await supabase.from('training_modules').delete().eq('training_id', training.id);
  }

  const modulesToInsert = modules.map((m, idx) => ({
    ...m,
    training_id: tData.id,
    order_index: idx + 1
  }));

  const { error: mError } = await supabase.from('training_modules').insert(modulesToInsert);
  if (mError) throw mError;

  return tData;
};

// --- NÁKUPY A PRIRADENIA ---
export const purchaseTraining = async (trainingId: string, companyId: string, price: number) => {
  return await supabase.from('company_purchases').insert({
    company_id: companyId,
    training_id: trainingId,
    price: price,
    status: 'active',
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  });
};

export const assignToEmployees = async (trainingId: string, employeeIds: string[], purchaseId: string) => {
  const assignments = employeeIds.map(empId => ({
    employee_id: empId,
    training_id: trainingId,
    company_purchase_id: purchaseId,
    status: 'assigned',
    progress_percentage: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
  return await supabase.from('employee_trainings').insert(assignments);
};

export const getEmployeeAssignments = async (employeeId: string) => {
  return await supabase
    .from('employee_trainings')
    .select(`*, training:trainings(*)`)
    .eq('employee_id', employeeId);
};

export const updateTrainingProgress = async (assignmentId: string, progress: number) => {
  const status = progress >= 100 ? 'completed' : 'in_progress';
  const completed_at = progress >= 100 ? new Date().toISOString() : null;
  return await supabase.from('employee_trainings').update({ progress_percentage: progress, status, completed_at }).eq('id', assignmentId);
};

// --- IP DOKUMENTY ---
export const uploadAndAssignIP = async (file: File, title: string, employeeIds: string[]) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Chýba prihlásenie.");

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error: storageError } = await supabase.storage.from('documents').upload(fileName, file);
  if (storageError) throw storageError;

  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
  const { data: docData, error: docError } = await supabase.from('documents').insert({ title, file_path: fileName, file_url: publicUrl, company_id: session.user.id }).select().single();
  if (docError) throw docError;

  const assignments = employeeIds.map(empId => ({ document_id: docData.id, employee_id: empId, status: 'PENDING' }));
  return await supabase.from('assigned_documents').insert(assignments);
};

export const getMyDocuments = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: [], error: 'No session' };
  return await supabase.from('assigned_documents').select('*, documents(*)').eq('employee_id', session.user.id);
};

export const signDocument = async (id: string) => {
  return await supabase.from('assigned_documents').update({ status: 'SIGNED', signed_at: new Date().toISOString() }).eq('id', id);
};

export const markAsViewed = async (id: string) => {
  return await supabase.from('assigned_documents').update({ viewed_at: new Date().toISOString() }).eq('id', id);
};

export const getAllAssignments = async () => {
  return await supabase.from('assigned_documents').select('*, employees(*), documents(*)').order('created_at', { ascending: false });
};
