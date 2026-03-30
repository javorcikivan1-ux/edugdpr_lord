
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
  if (!session?.user) return { data: [], error: 'No session' };

  return await supabase
    .from('assigned_documents')
    .select(`
      id,
      status,
      signed_at,
      viewed_at,
      document:documents ( id, title, file_url, created_at )
    `)
    .eq('employee_id', session.user.id);
};

export const uploadAndAssignSpecificDocumentType = async (file: File, title: string, employeeIds: string[], documentTypeId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Chýba prihlásenie.");

  const results = [];
  
  for (const employeeId of employeeIds) {
    try {
      // Vytvoríme unikátny názov súboru pre každého zamestnanca
      const safeName = sanitizeFilename(file.name);
      const fileName = `${employeeId}_${documentTypeId}_${Date.now()}_${safeName}`;
      
      // Nahrajeme súbor do Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (storageError) {
        results.push({ employeeId, success: false, error: storageError.message });
        continue;
      }

      // Získame public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Vytvoríme záznam v employee_documents tabuľke (rovnaká štruktúra ako v EmployeeDocumentsView)
      const documentData = {
        employee_id: employeeId,
        document_type_id: documentTypeId,
        document_name: title,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        assigned_at: new Date().toISOString(),
        status: 'pending'
      };

      const { error: docError } = await supabase
        .from('employee_documents')
        .insert(documentData);

      if (docError) {
        // Zmažeme súbor zo storage ak sa nepodarilo vytvoriť záznam
        await supabase.storage.from('documents').remove([fileName]);
        results.push({ employeeId, success: false, error: docError.message });
        continue;
      }

      results.push({ employeeId, success: true });
    } catch (error: any) {
      results.push({ employeeId, success: false, error: error.message });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  if (failCount === results.length) {
    throw new Error('Nepodarilo sa priradiť dokument žiadnemu zamestnancovi');
  }
  
  return { 
    success: true, 
    successCount, 
    failCount, 
    results 
  };
};

export const getAllAssignments = async (limit: number = 50, offset: number = 0, searchQuery?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: [], error: "No session" };

  const userId = session.user.id;

  if (searchQuery && searchQuery.trim()) {
    // Pre search: najprv nájdeme zamestnancov, potom ich priradenia
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_token', session.user.user_metadata?.company_token || `LB-${session.user.id.slice(0, 8).toUpperCase()}`)
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    
    if (!employees || employees.length === 0) {
      return { data: [], error: null };
    }
    
    const employeeIds = employees.map(e => e.id);
    
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
      .in('employee_id', employeeIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  } else {
    // Bez search: normálny query
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  }
};

export const getAssignmentsCount = async (searchQuery?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { count: 0, error: "No session" };

  const companyToken = session.user.user_metadata?.company_token || `LB-${session.user.id.slice(0, 8).toUpperCase()}`;

  if (searchQuery && searchQuery.trim()) {
    // Pre search: najprv nájdeme zamestnancov, potom ich priradenia
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_token', companyToken)
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    
    if (!employees || employees.length === 0) {
      return { count: 0, error: null };
    }
    
    const employeeIds = employees.map(e => e.id);
    
    // Najprv získať document IDs pre firmu
    const { data: documents } = await supabase
      .from('documents')
      .select('id')
      .eq('company_id', '6579ca13-869c-4925-b1b3-093a89b4c7d5');
    
    if (!documents || documents.length === 0) {
      return { count: 0, error: null };
    }
    
    const documentIds = documents.map(d => d.id);
    
    // Potom count assignments cez document IDs a employee IDs
    const { data, count, error } = await supabase
      .from('assigned_documents')
      .select('id', { count: 'exact' })
      .in('document_id', documentIds)
      .in('employee_id', employeeIds);
    
    return { count: count || 0, error };
  } else {
    // Bez search: najprv získať document IDs pre firmu
    const { data: documents } = await supabase
      .from('documents')
      .select('id')
      .eq('company_id', '6579ca13-869c-4925-b1b3-093a89b4c7d5');
    
    if (!documents || documents.length === 0) {
      return { count: 0, error: null };
    }
    
    const documentIds = documents.map(d => d.id);
    
    // Potom count assignments cez document IDs
    const { data, count, error } = await supabase
      .from('assigned_documents')
      .select('id', { count: 'exact' })
      .in('document_id', documentIds);
    
    return { count: count || 0, error };
  }
};

export const getEmployeesWithCertificates = async (limit: number = 20, offset: number = 0, searchQuery?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: [], error: "No session" };

  const userId = session.user.id;

  if (searchQuery && searchQuery.trim()) {
    // Pre search: najprv nájdeme zamestnancov, potom ich certifikáty
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_token', session.user.user_metadata?.company_token || `LB-${session.user.id.slice(0, 8).toUpperCase()}`)
      .neq('id', userId)
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    
    if (!employees || employees.length === 0) {
      return { data: [], error: null };
    }
    
    const employeeIds = employees.map(e => e.id);
    
    return await supabase
      .from('employees')
      .select(`
        id,
        full_name,
        email,
        certificates!left (
          id,
          certificate_number,
          issued_at,
          score,
          training:trainings(title, category)
        )
      `)
      .in('id', employeeIds)
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);
  } else {
    // Bez search: normálny query
    return await supabase
      .from('employees')
      .select(`
        id,
        full_name,
        email,
        certificates!left (
          id,
          certificate_number,
          issued_at,
          score,
          training:trainings(title, category)
        )
      `)
      .eq('company_token', session.user.user_metadata?.company_token || `LB-${session.user.id.slice(0, 8).toUpperCase()}`)
      .neq('id', userId)
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);
  }
};

export const getEmployeesWithCertificatesCount = async (searchQuery?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { count: 0, error: "No session" };

  if (searchQuery && searchQuery.trim()) {
    // Pre search: spočítame zamestnancov podľa searchu
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_token', session.user.user_metadata?.company_token || `LB-${session.user.id.slice(0, 8).toUpperCase()}`)
      .neq('id', session.user.id)
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    
    return { count: count || 0, error: null };
  } else {
    // Bez search: spočítame všetkých zamestnancov
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_token', session.user.user_metadata?.company_token || `LB-${session.user.id.slice(0, 8).toUpperCase()}`)
      .neq('id', session.user.id);
    
    return { count: count || 0, error: null };
  }
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
