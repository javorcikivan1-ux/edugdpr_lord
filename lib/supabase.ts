
import { createClient } from '@supabase/supabase-js'
import { isDemoMode } from './demoMode';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZHN1b3h0d3huZWxsbHVpb3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODkxNzIsImV4cCI6MjA4MTI2NTE3Mn0.bQe3EsPxCpqSivyrggj3X52a3io7PYoi-0PWB5LBCvo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Demo data
export const demoTrainings = [
  {
    id: 'demo-training-1',
    title: 'Základy GDPR',
    description: 'Školenie je určené pre zamestnancov, ktorí osobné údaje nespracúvajú ako súčasť svojej pracovnej činnosti, ale môžu s nimi prísť do kontaktu pri výkone práce. Účastníci sa oboznámia so základnými pravidlami ochrany osobných údajov, právnym rámcom podľa Nariadenie GDPR a zákon č. 18/2018 Z. z. a s postupmi, ako rozpoznať bezpečnostný incident a správne ho oznámiť podľa interných pravidiel organizácie.',
    duration: '45 minút',
    target_audience: 'Pre zamestnancov so základným kontaktom s osobnými údajmi',
    price: 12,
    training_type: 'standard',
    category: 'standard',
    icon: 'shield',
    color: 'orange',
    thumbnail: '/training-gdpr-basics.png',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-training-2',
    title: 'Manipulácia s osobnými údajmi',
    description: 'Školenie je určené pre zamestnancov, ktorí spracúvajú osobné údaje ako súčasť svojej pracovnej činnosti, na základe poverenia a podľa pokynov prevádzkovateľa (napr. administratívni pracovníci, personalisti, obchodníci alebo IT pracovníci). V tomto školení sú zamestnanci oboznámení so zásadami ochrany osobných údajov a požiadavkami Nariadenie GDPR a zákon č. 18/2018 Z. z.. Školenie vysvetľuje základné pojmy ochrany osobných údajov, zásady ich spracúvania, práva dotknutých osôb a povinnosti zamestnancov pri práci s údajmi. Súčasťou školenia sú aj bezpečnostné opatrenia, prevencia bezpečnostných incidentov a postup pri ich rozpoznaní a oznámení podľa interných pravidiel organizácie.',
    duration: '60 minút',
    target_audience: 'Pre zamestnancov, ktorí spracúvajú osobné údaje',
    price: 18,
    training_type: 'premium',
    category: 'premium',
    icon: 'building',
    color: 'blue',
    thumbnail: '/training-personal-data.png',
    status: 'published',
    created_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'demo-training-3',
    title: 'GDPR - Kamerový systém',
    description: 'Školenie je určené pre zamestnancov, ktorí obsluhujú kamerový systém, majú prístup k záznamom alebo sa podieľajú na jeho správe a kontrole, na základe poverenia a podľa pokynov prevádzkovateľa. V tomto školení sú zamestnanci oboznámení so zásadami ochrany osobných údajov pri prevádzke kamerového systému. Školenie vysvetľuje požiadavky Nariadenie GDPR a zákon č. 18/2018 Z. z., ako aj pravidlá prístupu k záznamom a ich ochrany. Účastníci sa zároveň oboznámia s postupmi pri nakladaní so záznamami a pri riešení bezpečnostných incidentov súvisiacich s prevádzkou kamerového systému.',
    duration: '60 minút',
    target_audience: 'Pre zamestnancov s prístupom ku kamerovému systému',
    price: 15,
    training_type: 'expert',
    category: 'expert',
    icon: 'camera',
    color: 'purple',
    thumbnail: '/training-camera.png',
    status: 'published',
    created_at: '2024-01-10T00:00:00Z'
  }
];
export const demoEmployees = [
  {
    id: 'demo-emp-1',
    full_name: 'Ján Novák',
    email: 'jan.novak@demo.sk',
    status: 'active',
    position: 'Manažér',
    company_token: 'DEMO',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'demo-emp-2',
    full_name: 'Mária Svobodová',
    email: 'maria.svobodova@demo.sk',
    status: 'active',
    position: 'Účtovník',
    company_token: 'DEMO',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'demo-emp-3',
    full_name: 'Peter Kováč',
    email: 'peter.kovac@demo.sk',
    status: 'active',
    position: 'Vývojár',
    company_token: 'DEMO',
    created_at: '2024-02-01T10:00:00Z'
  },
  {
    id: 'demo-emp-4',
    full_name: 'Anna Horváthová',
    email: 'anna.horvathova@demo.sk',
    status: 'active',
    position: 'HR manažér',
    company_token: 'DEMO',
    created_at: '2024-02-10T10:00:00Z'
  },
  {
    id: 'demo-emp-5',
    full_name: 'Michal Dúbravský',
    email: 'michal.dubravsky@demo.sk',
    status: 'active',
    position: 'Technik',
    company_token: 'DEMO',
    created_at: '2024-02-15T10:00:00Z'
  },
  {
    id: 'demo-emp-6',
    full_name: 'Lucia Poláková',
    email: 'lucia.polakova@demo.sk',
    status: 'active',
    position: 'Marketing',
    company_token: 'DEMO',
    created_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 'demo-emp-7',
    full_name: 'Tomáš Fiala',
    email: 'tomas.fiala@demo.sk',
    status: 'active',
    position: 'Predajca',
    company_token: 'DEMO',
    created_at: '2024-03-05T10:00:00Z'
  },
  {
    id: 'demo-emp-8',
    full_name: 'Eva Černá',
    email: 'eva.cerna@demo.sk',
    status: 'active',
    position: 'Asistentka',
    company_token: 'DEMO',
    created_at: '2024-03-10T10:00:00Z'
  },
  {
    id: 'demo-emp-9',
    full_name: 'Róbert Bielik',
    email: 'robert.bielik@demo.sk',
    status: 'active',
    position: 'Logistika',
    company_token: 'DEMO',
    created_at: '2024-03-15T10:00:00Z'
  },
  {
    id: 'demo-emp-10',
    full_name: 'Zuzana Kováčová',
    email: 'zuzana.kovacova@demo.sk',
    status: 'active',
    position: 'Sekretárka',
    company_token: 'DEMO',
    created_at: '2024-03-20T10:00:00Z'
  }
];
export const demoInvitations = [
  {
    id: 'demo-inv-1',
    email: 'kristina.kochanska@demo.sk',
    employee_name: 'Kristína Kochanská',
    company_token: 'DEMO',
    status: 'PENDING',
    invited_at: '2024-04-01T10:00:00Z'
  },
  {
    id: 'demo-inv-2',
    email: 'david.lister@demo.sk',
    employee_name: 'Dávid Lister',
    company_token: 'DEMO',
    status: 'PENDING',
    invited_at: '2024-04-05T10:00:00Z'
  }
];

const demoDocumentDefinitions = [
  { id: 'gdpr_employee_info', title: 'Informačné povinnosti zamestnancov' },
  { id: 'authorized_training', title: 'Záznam o poučení oprávnenej osoby' },
  { id: 'authorized_confidentiality', title: 'Zaviazanie oprávnenej osoby k mlčanlivosti' },
  { id: 'directive_personnel_security', title: 'Smernica pre riadenie personálnej bezpečnosti' },
  { id: 'directive_camera_system', title: 'Smernica pre kamerový systém' },
  { id: 'consent_data_processing', title: 'Súhlas so spracúvaním osobných údajov' },
  { id: 'protocol_activities', title: 'Preberací protokol k aktívam' }
];

const createDemoDocumentAssignment = (
  employeeId: string,
  documentTypeId: string,
  status: 'SIGNED' | 'PENDING',
  assignedAt: string,
  signedAt?: string,
  suffix = ''
) => {
  const employee = demoEmployees.find(e => e.id === employeeId);
  const documentDefinition = demoDocumentDefinitions.find(d => d.id === documentTypeId);
  const id = `demo-doc-${employeeId}-${documentTypeId}${suffix}`;

  return {
    id,
    employee_id: employeeId,
    status,
    created_at: assignedAt,
    signed_at: signedAt || null,
    employee: employee ? { id: employee.id, full_name: employee.full_name, email: employee.email } : undefined,
    document: {
      id: documentTypeId,
      title: documentDefinition?.title || 'Demo dokument',
      file_url: '#',
      document_type_id: documentTypeId,
      category: 'employee_document',
      type: 'employee_document'
    },
    document_type_id: documentTypeId
  };
};

export const demoDocumentAssignments = [
  createDemoDocumentAssignment('demo-emp-1', 'gdpr_employee_info', 'SIGNED', '2026-04-02T08:00:00Z', '2026-04-03T09:15:00Z'),
  createDemoDocumentAssignment('demo-emp-1', 'authorized_training', 'SIGNED', '2026-04-02T08:05:00Z', '2026-04-03T09:20:00Z'),
  createDemoDocumentAssignment('demo-emp-1', 'directive_personnel_security', 'PENDING', '2026-05-06T10:00:00Z'),

  createDemoDocumentAssignment('demo-emp-2', 'gdpr_employee_info', 'SIGNED', '2026-04-05T08:00:00Z', '2026-04-06T11:30:00Z'),
  createDemoDocumentAssignment('demo-emp-2', 'consent_data_processing', 'PENDING', '2026-05-03T14:00:00Z'),
  createDemoDocumentAssignment('demo-emp-2', 'protocol_activities', 'SIGNED', '2026-04-12T08:00:00Z', '2026-04-12T15:05:00Z'),

  createDemoDocumentAssignment('demo-emp-3', 'authorized_training', 'PENDING', '2026-05-01T08:00:00Z'),
  createDemoDocumentAssignment('demo-emp-3', 'authorized_confidentiality', 'PENDING', '2026-05-01T08:05:00Z'),
  createDemoDocumentAssignment('demo-emp-3', 'directive_camera_system', 'SIGNED', '2026-04-20T09:00:00Z', '2026-04-22T10:10:00Z'),

  createDemoDocumentAssignment('demo-emp-4', 'gdpr_employee_info', 'SIGNED', '2026-04-08T08:00:00Z', '2026-04-08T12:40:00Z'),
  createDemoDocumentAssignment('demo-emp-4', 'directive_personnel_security', 'SIGNED', '2026-04-08T08:10:00Z', '2026-04-09T08:15:00Z'),
  createDemoDocumentAssignment('demo-emp-4', 'consent_data_processing', 'SIGNED', '2026-04-08T08:20:00Z', '2026-04-09T08:18:00Z'),

  createDemoDocumentAssignment('demo-emp-5', 'gdpr_employee_info', 'PENDING', '2026-05-07T08:00:00Z'),
  createDemoDocumentAssignment('demo-emp-5', 'directive_camera_system', 'PENDING', '2026-05-07T08:05:00Z'),

  createDemoDocumentAssignment('demo-emp-6', 'gdpr_employee_info', 'SIGNED', '2026-04-17T08:00:00Z', '2026-04-18T13:00:00Z'),
  createDemoDocumentAssignment('demo-emp-6', 'consent_data_processing', 'SIGNED', '2026-04-17T08:05:00Z', '2026-04-18T13:05:00Z'),
  createDemoDocumentAssignment('demo-emp-6', 'authorized_confidentiality', 'PENDING', '2026-05-09T09:00:00Z')
];

export const demoCompanyPurchases = [
  {
    id: 'demo-purchase-1',
    company_id: 'demo',
    training_id: 'demo-training-1',
    total_licenses: 12,
    standard_licenses: 12,
    premium_licenses: 0,
    expert_licenses: 0,
    quantity: 12,
    status: 'active',
    purchase_date: '2024-03-01T00:00:00Z',
    training: demoTrainings.find(t => t.id === 'demo-training-1')
  },
  {
    id: 'demo-purchase-2',
    company_id: 'demo',
    training_id: 'demo-training-2',
    total_licenses: 4,
    standard_licenses: 0,
    premium_licenses: 4,
    expert_licenses: 0,
    quantity: 4,
    status: 'active',
    purchase_date: '2024-03-05T00:00:00Z',
    training: demoTrainings.find(t => t.id === 'demo-training-2')
  },
  {
    id: 'demo-purchase-3',
    company_id: 'demo',
    training_id: 'demo-training-3',
    total_licenses: 2,
    standard_licenses: 0,
    premium_licenses: 0,
    expert_licenses: 2,
    quantity: 2,
    status: 'active',
    purchase_date: '2024-03-10T00:00:00Z',
    training: demoTrainings.find(t => t.id === 'demo-training-3')
  }
];

export const demoCertificates = [
  {
    id: 'demo-cert-1',
    employee_id: 'demo-emp-1',
    training_id: 'demo-training-1',
    certificate_number: 'CERT-DEMO-2026-0001',
    issued_at: '2026-01-12T00:00:00Z',
    valid_until: '2026-07-12T00:00:00Z',
    score: 96,
    training: demoTrainings.find(t => t.id === 'demo-training-1')
  },
  {
    id: 'demo-cert-1-expired',
    employee_id: 'demo-emp-1',
    training_id: 'demo-training-2',
    certificate_number: 'CERT-DEMO-2025-0011',
    issued_at: '2025-08-15T00:00:00Z',
    valid_until: '2026-02-15T00:00:00Z',
    score: 89,
    training: demoTrainings.find(t => t.id === 'demo-training-2')
  },
  {
    id: 'demo-cert-2',
    employee_id: 'demo-emp-2',
    training_id: 'demo-training-1',
    certificate_number: 'CERT-DEMO-2026-0002',
    issued_at: '2026-02-05T00:00:00Z',
    valid_until: '2026-08-05T00:00:00Z',
    score: 92,
    training: demoTrainings.find(t => t.id === 'demo-training-1')
  },
  {
    id: 'demo-cert-3',
    employee_id: 'demo-emp-3',
    training_id: 'demo-training-2',
    certificate_number: 'CERT-DEMO-2025-0003',
    issued_at: '2025-08-20T00:00:00Z',
    valid_until: '2026-02-20T00:00:00Z',
    score: 88,
    training: demoTrainings.find(t => t.id === 'demo-training-2')
  },
  {
    id: 'demo-cert-4',
    employee_id: 'demo-emp-4',
    training_id: 'demo-training-2',
    certificate_number: 'CERT-DEMO-2026-0004',
    issued_at: '2026-04-01T00:00:00Z',
    valid_until: '2026-06-01T00:00:00Z',
    score: 94,
    training: demoTrainings.find(t => t.id === 'demo-training-2')
  },
  {
    id: 'demo-cert-5',
    employee_id: 'demo-emp-5',
    training_id: 'demo-training-3',
    certificate_number: 'CERT-DEMO-2025-0005',
    issued_at: '2025-09-10T00:00:00Z',
    valid_until: '2026-03-10T00:00:00Z',
    score: 90,
    training: demoTrainings.find(t => t.id === 'demo-training-3')
  },
  {
    id: 'demo-cert-6',
    employee_id: 'demo-emp-6',
    training_id: 'demo-training-3',
    certificate_number: 'CERT-DEMO-2026-0006',
    issued_at: '2026-03-15T00:00:00Z',
    valid_until: '2026-09-15T00:00:00Z',
    score: 98,
    training: demoTrainings.find(t => t.id === 'demo-training-3')
  },
  {
    id: 'demo-cert-7',
    employee_id: 'demo-emp-7',
    training_id: 'demo-training-1',
    certificate_number: 'CERT-DEMO-2026-0007',
    issued_at: '2026-04-22T00:00:00Z',
    valid_until: '2026-10-22T00:00:00Z',
    score: 86,
    training: demoTrainings.find(t => t.id === 'demo-training-1')
  },
  {
    id: 'demo-cert-8',
    employee_id: 'demo-emp-8',
    training_id: 'demo-training-1',
    certificate_number: 'CERT-DEMO-2025-0008',
    issued_at: '2025-07-03T00:00:00Z',
    valid_until: '2026-01-03T00:00:00Z',
    score: 84,
    training: demoTrainings.find(t => t.id === 'demo-training-1')
  },
  {
    id: 'demo-cert-9',
    employee_id: 'demo-emp-9',
    training_id: 'demo-training-2',
    certificate_number: 'CERT-DEMO-2026-0009',
    issued_at: '2026-05-01T00:00:00Z',
    valid_until: '2026-11-01T00:00:00Z',
    score: 91,
    training: demoTrainings.find(t => t.id === 'demo-training-2')
  },
  {
    id: 'demo-cert-10',
    employee_id: 'demo-emp-10',
    training_id: 'demo-training-3',
    certificate_number: 'CERT-DEMO-2026-0010',
    issued_at: '2026-05-10T00:00:00Z',
    valid_until: '2026-11-10T00:00:00Z',
    score: 95,
    training: demoTrainings.find(t => t.id === 'demo-training-3')
  }
];

export const demoEmployeeTrainings = [
  {
    id: 'demo-emp-train-1',
    employee_id: 'demo-emp-1',
    training_id: 'demo-training-1',
    assigned_at: '2024-03-02T00:00:00Z',
    status: 'completed',
    progress_percentage: 100,
    completed_at: '2026-01-12T00:00:00Z',
    employee: demoEmployees.find(e => e.id === 'demo-emp-1'),
    training: demoTrainings.find(t => t.id === 'demo-training-1'),
    certs: [demoCertificates.find(c => c.employee_id === 'demo-emp-1' && c.training_id === 'demo-training-1')]
  },
  {
    id: 'demo-emp-train-1-expired',
    employee_id: 'demo-emp-1',
    training_id: 'demo-training-2',
    assigned_at: '2025-08-01T00:00:00Z',
    status: 'completed',
    progress_percentage: 100,
    completed_at: '2025-08-15T00:00:00Z',
    employee: demoEmployees.find(e => e.id === 'demo-emp-1'),
    training: demoTrainings.find(t => t.id === 'demo-training-2'),
    certs: [demoCertificates.find(c => c.employee_id === 'demo-emp-1' && c.training_id === 'demo-training-2')]
  },
  {
    id: 'demo-emp-train-1-progress',
    employee_id: 'demo-emp-1',
    training_id: 'demo-training-3',
    assigned_at: '2026-05-08T00:00:00Z',
    status: 'in_progress',
    progress_percentage: 80,
    employee: demoEmployees.find(e => e.id === 'demo-emp-1'),
    training: demoTrainings.find(t => t.id === 'demo-training-3'),
    certs: []
  },
  {
    id: 'demo-emp-train-2',
    employee_id: 'demo-emp-2',
    training_id: 'demo-training-1',
    assigned_at: '2024-03-02T00:00:00Z',
    status: 'completed',
    progress_percentage: 100,
    completed_at: '2026-02-05T00:00:00Z',
    employee: demoEmployees.find(e => e.id === 'demo-emp-2'),
    training: demoTrainings.find(t => t.id === 'demo-training-1'),
    certs: [demoCertificates.find(c => c.employee_id === 'demo-emp-2' && c.training_id === 'demo-training-1')]
  },
  {
    id: 'demo-emp-train-3',
    employee_id: 'demo-emp-3',
    training_id: 'demo-training-2',
    assigned_at: '2024-03-06T00:00:00Z',
    status: 'completed',
    progress_percentage: 100,
    completed_at: '2025-08-20T00:00:00Z',
    employee: demoEmployees.find(e => e.id === 'demo-emp-3'),
    training: demoTrainings.find(t => t.id === 'demo-training-2'),
    certs: [demoCertificates.find(c => c.employee_id === 'demo-emp-3' && c.training_id === 'demo-training-2')]
  },
  {
    id: 'demo-emp-train-4',
    employee_id: 'demo-emp-4',
    training_id: 'demo-training-2',
    assigned_at: '2024-03-06T00:00:00Z',
    status: 'completed',
    progress_percentage: 100,
    completed_at: '2026-04-01T00:00:00Z',
    employee: demoEmployees.find(e => e.id === 'demo-emp-4'),
    training: demoTrainings.find(t => t.id === 'demo-training-2'),
    certs: [demoCertificates.find(c => c.employee_id === 'demo-emp-4' && c.training_id === 'demo-training-2')]
  },
  {
    id: 'demo-emp-train-5',
    employee_id: 'demo-emp-5',
    training_id: 'demo-training-3',
    assigned_at: '2024-03-11T00:00:00Z',
    status: 'in_progress',
    progress_percentage: 67,
    employee: demoEmployees.find(e => e.id === 'demo-emp-5'),
    training: demoTrainings.find(t => t.id === 'demo-training-3'),
    certs: []
  },
  {
    id: 'demo-emp-train-6',
    employee_id: 'demo-emp-6',
    training_id: 'demo-training-3',
    assigned_at: '2024-03-11T00:00:00Z',
    status: 'in_progress',
    progress_percentage: 33,
    employee: demoEmployees.find(e => e.id === 'demo-emp-6'),
    training: demoTrainings.find(t => t.id === 'demo-training-3'),
    certs: []
  }
];

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
  // Demo mode - return demo data
  if (isDemoMode()) {
    return { data: demoEmployees, error: null };
  }

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
  // Demo mode - prevent upload
  if (isDemoMode()) {
    return { error: 'Toto je demo účet. Upload súborov nie je povolený.' };
  }

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

  try {
    // Naítame dokumenty z oboch tabuliek súbezne
    const [assignedDocsResult, employeeDocsResult] = await Promise.all([
      supabase
        .from('assigned_documents')
        .select(`
          id,
          status,
          signed_at,
          viewed_at,
          document:documents ( id, title, file_url, created_at )
        `)
        .eq('employee_id', session.user.id),
      supabase
        .from('employee_documents')
        .select(`
          id,
          employee_id,
          document_name,
          document_type_id,
          status,
          assigned_at,
          acknowledged_at,
          created_at,
          file_path
        `)
        .eq('employee_id', session.user.id)
    ]);

    if (assignedDocsResult.error) throw assignedDocsResult.error;
    if (employeeDocsResult.error) throw employeeDocsResult.error;

    // Kombinujeme a normalizujeme dáta z oboch tabuliek
    const combinedDocs = [
      // Dokumenty z assigned_documents (staré dokumenty)
      ...(assignedDocsResult.data || []).map((doc: any) => ({
        ...doc,
        // Pre staré dokumenty zachováme pôvodnú stavbu
        document: doc.document || {
          id: doc.document?.id || doc.id,
          title: doc.document?.title || 'Neznámy dokument',
          file_url: doc.document?.file_url
        }
      })),
      // Dokumenty z employee_documents (nové dokumenty s konkrétnym typom)
      ...(employeeDocsResult.data || []).map((doc: any) => {
        // Vytvoríme URL pre súbor v storage
        const fileUrl = doc.file_path ? supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl : null;
        
        return {
          id: doc.id,
          employee_id: doc.employee_id,
          status: doc.status === 'signed' ? 'SIGNED' : doc.status === 'acknowledged' ? 'SIGNED' : doc.status === 'pending' ? 'PENDING' : doc.status.toUpperCase(),
          created_at: doc.assigned_at || doc.created_at, // Poui assigned_at, ak nie je null, inak created_at
          signed_at: doc.acknowledged_at, // Poui acknowledged_at pre employee_documents
          document: {
            id: doc.id,
            title: doc.document_name,
            file_url: fileUrl,
            created_at: doc.created_at
          }
        };
      })
    ];

    // Zoradíme podla dátumu vytvorenia
    combinedDocs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { data: combinedDocs, error: null };
  } catch (error) {
    console.error('Error in getMyDocuments:', error);
    return { data: [], error: error.message };
  }
};

export const uploadAndAssignSpecificDocumentType = async (file: File, title: string, employeeIds: string[], documentTypeId: string) => {
  // Demo mode - prevent upload
  if (isDemoMode()) {
    return { error: 'Toto je demo účet. Upload súborov nie je povolený.' };
  }

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
  // Demo mode - return demo data
  if (isDemoMode()) {
    const demoData = demoEmployees.slice(offset, offset + limit).map(emp => ({
      ...emp,
      certificates: demoCertificates.filter(cert => cert.employee_id === emp.id)
    }));
    return { data: demoData, error: null };
  }

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
  // Demo mode - return demo count
  if (isDemoMode()) {
    const count = searchQuery ? demoEmployees.filter(emp =>
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).length : demoEmployees.length;
    return { count, error: null };
  }

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
  // Demo mode - prevent purchase
  if (isDemoMode()) {
    return { data: null, error: { message: 'Toto je demo účet. Nákup školení nie je povolený.' } };
  }

  return await supabase
    .from('company_purchases')
    .insert(purchaseData)
    .select()
    .single();
};

export const getCompanyPurchases = async (companyId: string) => {
  if (companyId === 'demo') {
    return { data: demoCompanyPurchases, error: null };
  }
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
  // Demo mode - prevent assignment
  if (isDemoMode()) {
    return { data: null, error: { message: 'Toto je demo účet. Priraďovanie školení nie je povolené.' } };
  }

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
  // Demo mode - prevent update
  if (isDemoMode()) {
    return { data: null, error: { message: 'Toto je demo účet. Úprava statusu zamestnanca nie je povolená.' } };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authenticated session");

  return await supabase
    .from('employees')
    .update({ status })
    .eq('id', employeeId);
};

export const deleteEmployee = async (employeeId: string) => {
  // Demo mode - prevent delete
  if (isDemoMode()) {
    return { data: null, error: { message: 'Toto je demo účet. Odstránenie zamestnanca nie je povolené.' } };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authenticated session");

  return await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);
};
