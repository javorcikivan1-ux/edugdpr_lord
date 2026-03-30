
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Employee } from '../types';
import { supabase, getEmployees, uploadAndAssignIP, uploadAndAssignSpecificDocumentType, getAllAssignments, getAssignmentsCount } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { 
  FileText, 
  Upload, 
  Search, 
  RefreshCw, 
  FileCheck2, 
  FileDown, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  X,
  Users,
  Check,
  ExternalLink,
  History,
  PenTool,
  Trash2,
  AlertTriangle,
  Info,
  BarChart3,
  FolderOpen,
  Eye,
  Download,
  Loader2,
  Shield,
  Key,
  BookOpen,
  UserX,
  HelpCircle,
  Zap
} from 'lucide-react';

// TypeScript interface pre kategórie dokumentov
interface DocumentType {
  id: string;
  name: string;
  category: string;
  required: boolean;
}

interface DocumentSubsection {
  name?: string;
  types: DocumentType[];
}

interface DocumentCategory {
  name: string;
  icon: React.ReactNode;
  subsections?: DocumentSubsection[];
  directTypes?: DocumentType[];
  types?: DocumentType[];
}

export const IPManagementView = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Partial<Employee>[]>([]);
  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [assignmentsSummary, setAssignmentsSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Pagination states
  const [assignmentLimit, setAssignmentLimit] = useState(50);
  const [hasMoreAssignments, setHasMoreAssignments] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [monitorSearch, setMonitorSearch] = useState('');
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<any | null>(null);
  const [empSelectionSearch, setEmpSelectionSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<any | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [documentTypeModal, setDocumentTypeModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'specific' | 'other' | null>(null);
  const [specificTypeModal, setSpecificTypeModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [confirmSpecificModal, setConfirmSpecificModal] = useState(false);
  const [confirmTypeName, setConfirmTypeName] = useState('');
  
  // Filtrovanie dokumentov v detailnom zobrazení
  const [documentFilter, setDocumentFilter] = useState<'all' | 'specific' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'pending'>('all');
  
  // Export PDF modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportDocumentFilter, setExportDocumentFilter] = useState<'all' | 'specific' | 'other'>('all');
  const [exportStatusFilter, setExportStatusFilter] = useState<'all' | 'signed' | 'pending'>('all');
  const [exportCategoryFilter, setExportCategoryFilter] = useState<string>('all');
  const [exportAllEmployees, setExportAllEmployees] = useState(true);
  const [selectedEmployeesForExport, setSelectedEmployeesForExport] = useState<string[]>([]);
  
  // Info modal state
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Definícia kategórií dokumentov - rovnaká ako v EmployeeDocumentView
  const documentCategories: Record<string, DocumentCategory> = {
    gdpr: {
      name: 'Informácie o spracúvaní osobných údajov',
      icon: <Shield size={20} />,
      subsections: [
        {
          types: [
            { id: 'gdpr_employee_info', name: 'Informačné povinnosti zamestnancov', category: 'gdpr', required: true },
            { id: 'gdpr_processor_info', name: 'Oboznámenie o sprostredkovateľovi', category: 'gdpr', required: true },
            { id: 'gdpr_camera_info', name: 'Informačné povinnosti pri kamerovom systéme', category: 'gdpr', required: false }
          ]
        }
      ]
    },
    consents: {
      name: 'Súhlasy',
      icon: <CheckCircle2 size={20} />,
      subsections: [
        {
          types: [
            { id: 'consent_data_processing', name: 'Súhlas so spracúvaním osobných údajov', category: 'consents', required: true },
            { id: 'consent_data_publication', name: 'Súhlas so zverejnením osobných údajov', category: 'consents', required: true }
          ]
        }
      ]
    },
    access: {
      name: 'Prístupy, poverenia a evidencie',
      icon: <Key size={20} />,
      subsections: [
        {
          name: 'Neoprávnené osoby',
          types: [
            { id: 'unauthorized_confidentiality', name: 'Zaviazanie mlčanlivosti neoprávnenej osoby', category: 'access', required: true }
          ]
        },
        {
          name: 'Oprávnené osoby',
          types: [
            { id: 'authorized_competence', name: 'Preukázanie príslušnosti oprávnené osoby', category: 'access', required: true },
            { id: 'authorized_training', name: 'Záznam o poučení oprávnené osoby', category: 'access', required: true },
            { id: 'authorized_confidentiality', name: 'Zaviazanie oprávnené osoby k mlčanlivosti', category: 'access', required: true }
          ]
        },
        {
          name: 'Oprávnenia',
          types: [
            { id: 'access_user_system', name: 'Používateľské oprávnenie do informačných systémov', category: 'access', required: false },
            { id: 'access_secure_area', name: 'Oprávnenie na vstup do chráneného priestoru', category: 'access', required: false }
          ]
        }
      ]
    },
    protocols: {
      name: 'Preberacie protokoly',
      icon: <FileText size={20} />,
      subsections: [
        {
          types: [
            { id: 'protocol_activities', name: 'Preberací protokol k aktívam', category: 'protocols', required: true },
            { id: 'protocol_access_resources', name: 'Preberací protokol k prístupovým prostriedkom', category: 'protocols', required: true }
          ]
        }
      ]
    },
    authorized_persons_docs: {
      name: 'Dokumenty pre oprávnené osoby',
      icon: <FileCheck2 size={20} />,
      subsections: [
        {
          types: [
            { id: 'authorized_data_handling', name: 'Smernica pre manipuláciu s osobnými údajmi', category: 'authorized_persons_docs', required: true },
            { id: 'authorized_internal_rules', name: 'Interné pravidlá a pokyny', category: 'authorized_persons_docs', required: true }
          ]
        }
      ]
    },
    internal_directives: {
      name: 'Interné smernice a riadenie',
      icon: <BookOpen size={20} />,
      subsections: [
        {
          types: [
            { id: 'directive_personnel_security', name: 'Smernica pre riadenie personálnej bezpečnosti', category: 'internal_directives', required: true },
            { id: 'directive_security_incidents', name: 'Smernica pre riadenie bezpečnostných incidentov', category: 'internal_directives', required: true },
            { id: 'directive_activities', name: 'Smernica pre riadenie aktív', category: 'internal_directives', required: true },
            { id: 'directive_rights_exercise', name: 'Smernica pre výkon práv dotknutých osôb', category: 'internal_directives', required: true },
            { id: 'directive_control_activities', name: 'Smernica pre kontrolnú činnosť', category: 'internal_directives', required: true },
            { id: 'directive_camera_system', name: 'Smernica pre kamerový systém', category: 'internal_directives', required: false }
          ]
        }
      ]
    },
    revocation: {
      name: 'Odobratie oprávnení a odovzdanie aktív',
      icon: <UserX size={20} />,
      subsections: [
        {
          types: [
            { id: 'revocation_authorized_person', name: 'Záznam o odobratí oprávnenia oprávnené osobe', category: 'revocation', required: true },
            { id: 'revocation_user_access', name: 'Záznam o odobratí používateľských oprávnení', category: 'revocation', required: true },
            { id: 'revocation_system_access', name: 'Záznam o odobratí prístupov do informačných systémov', category: 'revocation', required: true },
            { id: 'revocation_secure_area_access', name: 'Záznam o odobratí oprávnenia na vstup do chráneného priestoru', category: 'revocation', required: true },
            { id: 'handover_access_resources', name: 'Záznam o odovzdaní prístupových prostriedkov', category: 'revocation', required: true },
            { id: 'handover_activities', name: 'Protokol o odovzdaní aktív', category: 'revocation', required: true }
          ]
        }
      ]
    }
  };

  // Helper funkcia na zistenie, či dokument má konkrétny typ
  const isSpecificDocumentType = (doc: any) => {
    if (!doc.document?.document_type_id) return false;
    
    // Skontrolujeme, či document_type_id existuje v našich definovaných kategóriách
    for (const category of Object.values(documentCategories)) {
      if (category.directTypes?.some(type => type.id === doc.document.document_type_id)) {
        return true;
      }
      if (category.types?.some(type => type.id === doc.document.document_type_id)) {
        return true;
      }
      if (category.subsections) {
        for (const subsection of category.subsections) {
          if (subsection.types?.some(type => type.id === doc.document.document_type_id)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Helper funkcia na získanie názvu konkrétneho typu dokumentu
  const getSpecificDocumentTypeName = (doc: any) => {
    if (!doc.document?.document_type_id) return null;
    
    // Prehľadáme všetky kategórie a podkategórie
    for (const category of Object.values(documentCategories)) {
      // Skontrolujeme directTypes
      if (category.directTypes) {
        const found = category.directTypes.find(type => type.id === doc.document.document_type_id);
        if (found) return found.name;
      }
      
      // Skontrolujeme types
      if (category.types) {
        const found = category.types.find(type => type.id === doc.document.document_type_id);
        if (found) return found.name;
      }
      
      // Skontrolujeme subsections
      if (category.subsections) {
        for (const subsection of category.subsections) {
          if (subsection.types) {
            const found = subsection.types.find(type => type.id === doc.document.document_type_id);
            if (found) return found.name;
          }
        }
      }
    }
    
    return null;
  };

  // Filtrovanie dokumentov podľa vybraných filtrov
  const filteredDocs = useMemo(() => {
    if (!selectedEmployeeDetail?.docs) return [];
    
    return selectedEmployeeDetail.docs.filter((doc: any) => {
      // Filtrovanie podľa typu dokumentu
      if (documentFilter !== 'all') {
        const isSpecific = isSpecificDocumentType(doc);
        if (documentFilter === 'specific' && !isSpecific) return false;
        if (documentFilter === 'other' && isSpecific) return false;
      }
      
      // Filtrovanie podľa stavu - spracujeme aj 'acknowledged' ako podpísané
      if (statusFilter !== 'all') {
        const isSigned = doc.status === 'SIGNED' || doc.status === 'ACKNOWLEDGED';
        if (statusFilter === 'signed' && !isSigned) return false;
        if (statusFilter === 'pending' && isSigned) return false;
      }
      
      return true;
    });
  }, [selectedEmployeeDetail?.docs, documentFilter, statusFilter]);

  // Search timeout state
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = async (searchQuery?: string) => {
    if (!searchQuery) setLoading(true);
    try {
      const { data: empData } = await getEmployees();
      if (empData) {
        setEmployees(empData.map(d => ({ 
          id: d.id, 
          name: d.full_name || d.email, 
          status: d.status, 
          email: d.email 
        })));
      }
      
      const finalSearchQuery = searchQuery || monitorSearch;
      
      // Načítame z oboch tabuliek súčasne
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Získame company_token z databázy pre prihláseného používateľa
      const { data: userProfile } = await supabase
        .from('employees')
        .select('company_token')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const companyToken = userProfile?.company_token || session.user.user_metadata?.company_token || session.user.user_metadata?.token;
      
      if (!companyToken) {
        console.error('No company token found for user:', session.user.id);
        return;
      }
      
      // Najprv získame employee IDs s daným company_token
      const { data: companyEmployees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_token', companyToken);
      
      const employeeIds = companyEmployees?.map(e => e.id) || [];
      
      if (employeeIds.length === 0) {
        console.log('No employees found for company:', companyToken);
        setAssignmentsSummary([]);
        setHasMoreAssignments(false);
        return;
      }
      
      const [assignedResult, employeeResult] = await Promise.all([
        getAllAssignments(assignmentLimit, 0, finalSearchQuery),
        // Načítame dokumenty len pre employee s daným company_token (bez document relácie)
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
            created_at
          `)
          .in('employee_id', employeeIds)
          .order('assigned_at', { ascending: false })
      ]);
      
      let combinedAssignments = [...(assignedResult.data || [])];
      
      // Pridame dokumenty z employee_documents
        if (employeeResult.data) {
          // Získame zoznam unikátnych employee IDs z dokumentov
          const docEmployeeIds = [...new Set(employeeResult.data.map(doc => doc.employee_id))];
          const { data: employeesData } = await supabase
            .from('employees')
            .select('id, full_name, email')
            .in('id', docEmployeeIds);
          
          // Vytvoríme mapu pre rýchly prístup k employee dátam
          const employeeMap = new Map();
          employeesData?.forEach(emp => {
            employeeMap.set(emp.id, emp);
          });
          
          // Pridame dokumenty z employee_documents
          employeeResult.data.forEach(doc => {
            combinedAssignments.push({
              id: doc.id,
              status: doc.status === 'signed' ? 'SIGNED' : doc.status.toUpperCase(),
              created_at: doc.assigned_at || doc.created_at,
              signed_at: doc.acknowledged_at,
              employee_id: doc.employee_id,
              employee: employeeMap.get(doc.employee_id) || { id: doc.employee_id, full_name: 'Neznámy', email: '' },
              document: {
                id: doc.document_type_id,
                title: doc.document_name,
                company_id: session.user.id,
                category: 'employee_document',
                type: 'employee_document',
                document_type_id: doc.document_type_id
              },
              document_type_id: doc.document_type_id
            });
          });
        }
      
      // Zoradíme podľa dátumu
      combinedAssignments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Aplikujeme limit na kombinované dáta
      const limitedData = combinedAssignments.slice(0, assignmentLimit);
      
      setAssignmentsSummary(limitedData);
      
      // Spočítame celkový počet z oboch tabuliek
      const { count: assignedCount } = await getAssignmentsCount(finalSearchQuery);
      
      // Získame company_token pre počítanie
      const { data: countProfile } = await supabase
        .from('employees')
        .select('company_token')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const countCompanyToken = countProfile?.company_token || session.user.user_metadata?.company_token || session.user.user_metadata?.token;
      
      const { count: employeeCount } = await supabase
        .from('employee_documents')
        .select('id', { count: 'exact', head: true })
        .in('employee_id', employeeIds);
      
      const totalCount = (assignedCount || 0) + (employeeCount || 0);
      setHasMoreAssignments(totalCount > assignmentLimit);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const loadMoreAssignments = async () => {
    try {
      // Načítame ďalšie dáta z oboch tabuliek
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Získame company_token z databázy pre prihláseného používateľa
      const { data: userProfile } = await supabase
        .from('employees')
        .select('company_token')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const companyToken = userProfile?.company_token || session.user.user_metadata?.company_token || session.user.user_metadata?.token;
      
      if (!companyToken) {
        console.error('No company token found for user:', session.user.id);
        return;
      }
      
      // Najprv získame employee IDs s daným company_token
      const { data: companyEmployees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_token', companyToken);
      
      const employeeIds = companyEmployees?.map(e => e.id) || [];
      
      const [assignedResult, employeeResult] = await Promise.all([
        getAllAssignments(50, assignmentsSummary.length, monitorSearch),
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
            created_at
          `)
          .in('employee_id', employeeIds)
          .order('assigned_at', { ascending: false })
          .range(assignmentsSummary.length, assignmentsSummary.length + 49) // 50 ďalších záznamov
      ]);
      
      let newAssignments = [...(assignedResult.data || [])];
      
      // Pridame dokumenty z employee_documents
      if (employeeResult.data) {
        // Získame zoznam employee IDs a načítame ich detaily
        const employeeIds = [...new Set(employeeResult.data.map(doc => doc.employee_id))];
        const { data: employeesData } = await supabase
          .from('employees')
          .select('id, full_name, email')
          .in('id', employeeIds);
        
        // Vytvoríme mapu pre rýchly prístup k employee dátam
        const employeeMap = new Map();
        employeesData?.forEach(emp => {
          employeeMap.set(emp.id, emp);
        });
        
        const employeeDocs = employeeResult.data.map(doc => {
          console.log('LoadMore - Employee document status:', doc.status, 'for document:', doc.document_name);
          return {
            id: doc.id,
            status: doc.status === 'signed' ? 'SIGNED' : doc.status.toUpperCase(),
            created_at: doc.assigned_at || doc.created_at, // Použiť assigned_at, ak nie je null, inak created_at
            signed_at: doc.acknowledged_at, // Použiť acknowledged_at pre employee_documents
            employee_id: doc.employee_id,
            employee: employeeMap.get(doc.employee_id) || { id: doc.employee_id, full_name: 'Neznámy', email: '' },
            document: {
              id: doc.id,
              title: doc.document_name,
              document_type_id: doc.document_type_id
            }
          };
        });
        newAssignments = [...newAssignments, ...employeeDocs];
      }
      
      // Zoradíme a pridame k existujúcim
      const combinedData = [...assignmentsSummary, ...newAssignments];
      combinedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setAssignmentsSummary(combinedData);
      setAssignmentLimit(assignmentsSummary.length + 50);
    } catch (err: any) {
      console.error("Chyba pri načítaní viac priradení:", err);
    }
  };

  // Search handler s debouncing
  const handleSearch = (value: string) => {
    setMonitorSearch(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout - načítame až po skončení písania
    const timeout = setTimeout(() => {
      setSearchLoading(true);
      // Reset a načítanie nových dát - zachováme staré dáta počas načítania
      setAssignmentLimit(50);
      
      // Načítanie - prázdne = všetko, inak = search
      fetchData(value.trim() === '' ? undefined : value.trim());
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  useEffect(() => { fetchData(); }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const groupedMonitor = useMemo(() => {
    const map = new Map();
    assignmentsSummary.forEach(a => {
      const empId = a.employee_id;
      if (!map.has(empId)) {
        map.set(empId, {
          id: empId,
          name: a.employee?.full_name || a.employee?.email || 'Neznámy',
          email: a.employee?.email,
          assignedCount: 0,
          signedCount: 0
        });
      }
      const entry = map.get(empId);
      entry.assignedCount++;
      if (a.status === 'SIGNED' || a.status === 'ACKNOWLEDGED') entry.signedCount++;
    });

    return Array.from(map.values());
  }, [assignmentsSummary]);

  const handleOpenDetail = async (empSummary: any) => {
    setSelectedEmployeeDetail(empSummary);
    setDetailLoading(true);
    try {
      // Načítame dokumenty z oboch tabuliek
      const [assignedDocsResult, employeeDocsResult] = await Promise.all([
        supabase
          .from('assigned_documents')
          .select('*, document:document_id(*)')
          .eq('employee_id', empSummary.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('employee_documents')
          .select('*')
          .eq('employee_id', empSummary.id)
          .order('assigned_at', { ascending: false })
      ]);

      if (assignedDocsResult.error) throw assignedDocsResult.error;
      if (employeeDocsResult.error) throw employeeDocsResult.error;

      // Kombinujeme a normalizujeme dáta z oboch tabuliek
      const combinedDocs = [
        // Dokumenty z assigned_documents (staré dokumenty)
        ...(assignedDocsResult.data || []).map(doc => ({
          ...doc,
          // Pre staré dokumenty vytvoríme falošný document objekt
          document: doc.document || {
            id: doc.document_id,
            title: doc.document?.title || 'Neznámy dokument',
            file_url: doc.document?.file_url
          }
        })),
        // Dokumenty z employee_documents (nové dokumenty s konkrétnym typom)
        ...(employeeDocsResult.data || []).map(doc => {
          console.log('Detail - Employee document status:', doc.status, 'for document:', doc.document_name);
          return {
            id: doc.id,
            employee_id: doc.employee_id,
            status: doc.status === 'signed' ? 'SIGNED' : doc.status.toUpperCase(),
            created_at: doc.assigned_at || doc.created_at, // Použiť assigned_at, ak nie je null, inak created_at
            signed_at: doc.acknowledged_at, // Použiť acknowledged_at pre employee_documents
            document: {
              id: doc.id,
              title: doc.document_name,
              file_url: supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl,
              document_type_id: doc.document_type_id
            }
          };
        })
      ];

      // Zoradíme podľa dátumu vytvorenia
      combinedDocs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSelectedEmployeeDetail({
        ...empSummary,
        docs: combinedDocs,
        assignedCount: combinedDocs.length,
        signedCount: combinedDocs.filter(doc => doc.status === 'SIGNED' || doc.status === 'ACKNOWLEDGED').length
      });
    } catch (err: any) {
      showToast('Chyba pri načítaní: ' + err.message, 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async (doc: any) => {
    const url = doc.document?.file_url;
    const title = doc.document?.title;
    if (!url) return;
    
    setDownloadingIds(prev => new Set(prev).add(doc.id));
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const ext = url.split('.').pop()?.split('?')[0] || 'pdf';
      link.setAttribute('download', `${title}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    }
  };

  const handleDeleteAssignment = async (doc: any) => {
    try {
      // Zistíme, z ktorej tabuľky je dokument
      const isEmployeeDoc = doc.document?.document_type_id !== undefined;
      
      if (isEmployeeDoc) {
        // Mazanie z employee_documents
        const { error } = await supabase.from('employee_documents').delete().eq('id', doc.id);
        if (error) throw error;
        
        // Zmažeme aj súbor zo storage
        if (doc.document?.file_url) {
          const filePath = doc.document.file_url.split('/').pop();
          if (filePath) {
            await supabase.storage.from('documents').remove([filePath]);
          }
        }
      } else {
        // Mazanie z assigned_documents
        const { error } = await supabase.from('assigned_documents').delete().eq('id', doc.id);
        if (error) throw error;
      }
      
      showToast('Priradenie bolo zrušené', 'success');
      if (selectedEmployeeDetail && selectedEmployeeDetail.docs) {
        const updatedDocs = selectedEmployeeDetail.docs.filter((d: any) => d.id !== doc.id);
        if (updatedDocs.length === 0) setSelectedEmployeeDetail(null);
        else {
          setSelectedEmployeeDetail({
            ...selectedEmployeeDetail,
            docs: updatedDocs,
            assignedCount: updatedDocs.length,
            signedCount: updatedDocs.filter((d: any) => d.status === 'SIGNED').length
          });
        }
      }
      setDeleteConfirmId(null);
      await fetchData();
    } catch (err: any) {
      showToast('Chyba pri mazaní: ' + err.message, 'error');
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !fileTitle || selectedEmps.length === 0) {
      showToast('Vyberte súbor, názov a adresátov', 'error');
      return;
    }
    // Otvorí výberový modal namiesto priameho nahrávania
    setDocumentTypeModal(true);
  };

  const handleDocumentTypeSelect = async (type: 'specific' | 'other') => {
    setSelectedDocumentType(type);
    setDocumentTypeModal(false);
    
    if (type === 'specific') {
      // Otvorí modal pre výber konkrétneho typu dokumentu
      setSpecificTypeModal(true);
    } else {
      // Starý systém - jednoduché nahratie
      setIsUploading(true);
      try {
        const result = await uploadAndAssignIP(selectedFile, fileTitle, selectedEmps);
        if (result.success) {
          showToast('Dokument úspešne priradený', 'success');
          setFileTitle('');
          setSelectedFile(null);
          setSelectedEmps([]);
          await fetchData();
        }
      } catch (error: any) {
        showToast('Chyba: ' + (error.message || 'Nepodarilo sa nahrať súbor'), 'error');
      } finally {
        setIsUploading(false);
        setSelectedDocumentType(null);
      }
    }
  };

  const handleSpecificTypeSelect = (typeId: string, typeName: string) => {
    setSelectedTypeId(typeId);
    setConfirmTypeName(typeName);
    setSpecificTypeModal(false);
    // Otvorí potvrdzovací modal
    setConfirmSpecificModal(true);
  };

  const confirmSpecificType = async () => {
    setConfirmSpecificModal(false);
    
    setIsUploading(true);
    try {
      // Použijeme novú funkciu pre priraďovanie konkrétneho typu dokumentu
      const result = await uploadAndAssignSpecificDocumentType(
        selectedFile!, 
        fileTitle, 
        selectedEmps, 
        selectedTypeId!
      );
      
      if (result.success) {
        let message = `Dokument bol úspešne priradený ako: ${confirmTypeName}`;
        if (result.failCount > 0) {
          message += ` (${result.successCount} z ${selectedEmps.length} zamestnancom)`;
        }
        showToast(message, 'success');
        setFileTitle('');
        setSelectedFile(null);
        setSelectedEmps([]);
        await fetchData();
      }
    } catch (error: any) {
      showToast('Chyba: ' + (error.message || 'Nepodarilo sa priradiť dokument'), 'error');
    } finally {
      setIsUploading(false);
      setSelectedDocumentType(null);
      setSelectedTypeId(null);
      setConfirmTypeName('');
    }
  };

  const exportToPDF = async () => {
    setExportModalOpen(true);
  };

  const performExport = async () => {
    setIsExportingPDF(true);
    setExportModalOpen(false);
    try {
      console.log('Exporting PDF with filters:', {
        documentFilter: exportDocumentFilter,
        statusFilter: exportStatusFilter,
        categoryFilter: exportCategoryFilter,
        allEmployees: exportAllEmployees,
        selectedEmployees: selectedEmployeesForExport
      });

      // Vyberieme zamestnancov pre export
      const employeesToExport = exportAllEmployees 
        ? groupedMonitor 
        : groupedMonitor.filter(emp => selectedEmployeesForExport.includes(emp.id));

      if (employeesToExport.length === 0) {
        showToast('Neboli vybraní žiadni zamestnanci pre export', 'error');
        return;
      }

      // Načítame detaily pre vybraných zamestnancov
      const allDocs = await Promise.all(
        employeesToExport.map(async (emp) => {
          // Načítame dokumenty z oboch tabuliek
          const [assignedDocsResult, employeeDocsResult] = await Promise.all([
            supabase
              .from('assigned_documents')
              .select('*, document:document_id(*)')
              .eq('employee_id', emp.id)
              .order('created_at', { ascending: false }),
            supabase
              .from('employee_documents')
              .select('*')
              .eq('employee_id', emp.id)
              .order('assigned_at', { ascending: false })
          ]);

          // Kombinujeme dokumenty
          const combinedDocs = [
            ...(assignedDocsResult.data || []).map(doc => ({
              ...doc,
              document: doc.document || {
                id: doc.document_id,
                title: doc.document?.title || 'Neznámy dokument',
                file_url: doc.document?.file_url
              }
            })),
            ...(employeeDocsResult.data || []).map(doc => ({
              id: doc.id,
              employee_id: doc.employee_id,
              status: doc.status === 'signed' ? 'SIGNED' : doc.status.toUpperCase(),
              created_at: doc.assigned_at || doc.created_at,
              signed_at: doc.acknowledged_at,
              document: {
                id: doc.id,
                title: doc.document_name,
                document_type_id: doc.document_type_id
              }
            }))
          ];

          // Aplikujeme filtre
          const filteredDocs = combinedDocs.filter((doc: any) => {
            // Filter podľa typu dokumentu
            if (exportDocumentFilter !== 'all') {
              const isSpecific = isSpecificDocumentType(doc);
              if (exportDocumentFilter === 'specific' && !isSpecific) return false;
              if (exportDocumentFilter === 'other' && isSpecific) return false;
            }

            // Filter podľa stavu
            if (exportStatusFilter !== 'all') {
              const isSigned = doc.status === 'SIGNED' || doc.status === 'ACKNOWLEDGED';
              if (exportStatusFilter === 'signed' && !isSigned) return false;
              if (exportStatusFilter === 'pending' && isSigned) return false;
            }

            // Filter podľa kategórie
            if (exportCategoryFilter !== 'all' && doc.document?.document_type_id) {
              // Zistíme kategóriu dokumentu
              let docCategory = null;
              for (const [categoryKey, category] of Object.entries(documentCategories)) {
                if (category.directTypes?.some(type => type.id === doc.document.document_type_id) ||
                    category.types?.some(type => type.id === doc.document.document_type_id)) {
                  docCategory = categoryKey;
                  break;
                }
                if (category.subsections) {
                  for (const subsection of category.subsections) {
                    if (subsection.types?.some(type => type.id === doc.document.document_type_id)) {
                      docCategory = categoryKey;
                      break;
                    }
                  }
                }
                if (docCategory) break;
              }
              if (docCategory !== exportCategoryFilter) return false;
            }

            return true;
          });

          return { 
            ...emp, 
            docs: filteredDocs,
            assignedCount: filteredDocs.length,
            signedCount: filteredDocs.filter(doc => doc.status === 'SIGNED' || doc.status === 'ACKNOWLEDGED').length
          };
        })
      );

      const currentDate = new Date().toLocaleDateString('sk-SK');
      const filterDescription = [
        exportDocumentFilter !== 'all' ? `Typ: ${exportDocumentFilter === 'specific' ? 'Konkrétny typ' : 'Iné dokumenty'}` : null,
        exportStatusFilter !== 'all' ? `Stav: ${exportStatusFilter === 'signed' ? 'Podpísané' : 'Čakajúce'}` : null,
        exportCategoryFilter !== 'all' ? `Kategória: ${documentCategories[exportCategoryFilter]?.name}` : null,
        !exportAllEmployees ? `Zamestnanci: ${selectedEmployeesForExport.length}` : null
      ].filter(Boolean).join(' | ');
      
      // Vytvoríme HTML obsah
      const pdfContent = `
        <!DOCTYPE html>
        <html lang="sk">
        <head>
          <meta charset="utf-8" />
        <style>
          .pdf-root {
            box-sizing: border-box;
            padding: 10mm;
            font-size: 11pt;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.5;
            color: #0f172a;
            background-color: #f8fafc;
          }
          .pdf-container { 
            box-sizing: border-box;
            max-width: 100%; 
            display: flex; 
            flex-direction: column; 
            gap: 14px;
          }
          .header { 
            page-break-after: avoid; 
            text-align: center; 
            margin-bottom: 18px;
            border-bottom: 1px solid #1e293b;
            padding: 12px 14px 14px;
            background: linear-gradient(to right, #020617, #1e293b);
            color: #e5e7eb;
            border-radius: 16px;
          }
          .header h1 {
            margin: 0;
            font-size: 13pt;
            font-weight: 700;
            letter-spacing: 0.01em;
          }
          .header p {
            margin: 6px 0 0;
            font-size: 10pt;
            color: #c7d2fe;
          }
          .employee { 
            page-break-inside: avoid;
            break-inside: avoid;
            padding: 12px 14px; 
            border: 1px solid #e2e8f0; 
            background: #ffffff;
            flex-shrink: 0;
            margin-bottom: 14px;
            border-radius: 14px;
            max-width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          }
          .document { 
            margin-bottom: 8px; 
            padding: 8px 10px; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            background: #f9fafb;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }
          .document-title { 
            font-weight: 600; 
            color: #020617; 
            margin-bottom: 4px;
            font-size: 12pt;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.3;
          }
          .document-type {
            font-size: 9pt;
            color: #666;
            margin-bottom: 2px;
          }
          h1, h2, h3 { 
            page-break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 0;
          }
          h2 { 
            color: #0f172a; 
            font-size: 12pt; 
            margin-bottom: 4px;
            margin-top: 10px;
            font-weight: 700;
          }
          h3 { 
            color: #334155; 
            font-size: 11pt; 
            margin-top: 8px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          p { 
            margin: 1px 0;
            font-size: 11pt;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.4;
          }
          .stats {
            font-weight: 800;
            font-size: 11pt;
            color: #f97316;
          }
        </style>
        </head>
        <body>
        <div class="pdf-root">
        <div class="pdf-container">
          <div class="header">
            <h1>Prehľad podpisov informačných povinností</h1>
            <p>Dátum: ${currentDate} | Zamestnanci: ${employeesToExport.length}${filterDescription ? ' | ' + filterDescription : ''}</p>
          </div>
          ${allDocs.map((emp) => {
            if (emp.docs.length === 0) return '';
            
            const docsHtml = emp.docs.map((doc: any) => {
              const docTypeName = getSpecificDocumentTypeName(doc);
              return `
                <div class="document">
                  <div class="document-title">${(doc.document?.title || 'Dokument').substring(0, 80)}${doc.document?.title && doc.document.title.length > 80 ? '...' : ''}</div>
                  ${docTypeName ? `<div class="document-type">Typ: ${docTypeName}</div>` : ''}
                  <div style="font-size: 11pt; color: #666; margin-bottom: 1px;">
                    Stav: ${doc.status === 'SIGNED' || doc.status === 'ACKNOWLEDGED' ? '<span style="color: #16a34a; font-weight: 600;">✓ Podpísané</span>' : '⏰ Čaká na podpis'}
                  </div>
                  <div style="font-size: 11pt; color: #666;">
                    Priradené: ${new Date(doc.created_at).toLocaleDateString('sk-SK')}${doc.signed_at ? ' | Podpísané: ' + new Date(doc.signed_at).toLocaleDateString('sk-SK') : ''}
                  </div>
                </div>
              `;
            }).join('');
            
            return `
              <div class="employee">
                <h2>${emp.name}</h2>
                <p>${emp.email}</p>
                <p class="stats">${emp.signedCount}/${emp.assignedCount} podpísané</p>
                <h3>Dokumenty (${emp.docs.length}):</h3>
                ${docsHtml}
              </div>
            `;
          }).join('') || '<div class="employee"><p style="color: #666; font-style: italic;">Žiadne dokumenty nevyhovujú zvoleným filtrom</p></div>'}
        </div>
        </div>
        </body>
        </html>
      `;

      const opt = {
        margin: 10,
        filename: `prehled-podpisov-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 1.2, 
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          precision: 16
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        font: { size: 11 }
      };

      console.log('Starting PDF generation...');
      await html2pdf().set(opt).from(pdfContent).save();
      console.log('PDF generation completed');
      
      showToast('PDF prehľadu úspešne vygenerované', 'success');
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      showToast('Chyba pri generovaní PDF: ' + error.message, 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportEmployeeToPDF = async (employee: any) => {
    setIsExportingPDF(true);
    try {
      console.log('Exporting PDF for single employee:', employee.name);
      
      // Načítame detaily zamestnanca
      const { data: docs } = await supabase
        .from('assigned_documents')
        .select('*, document:document_id(*)')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });

      const currentDate = new Date().toLocaleDateString('sk-SK');
      
      // Vytvoríme HTML obsah pre samostatný dokument pre html2pdf – s vlastným rootom, nie body
      const pdfContent = `
        <!DOCTYPE html>
        <html lang="sk">
        <head>
          <meta charset="utf-8" />
        <style>
          .pdf-root {
            box-sizing: border-box;
            padding: 10mm;
            font-size: 11pt;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.5;
            color: #0f172a;
            background-color: #f8fafc;
          }
          .pdf-container { 
            box-sizing: border-box;
            max-width: 100%; 
            display: flex; 
            flex-direction: column; 
            gap: 14px;
          }
          .header { 
            page-break-after: avoid; 
            text-align: center; 
            margin-bottom: 18px;
            border-bottom: 1px solid #1e293b;
            padding: 12px 14px 14px;
            background: linear-gradient(to right, #020617, #1e293b);
            color: #e5e7eb;
            border-radius: 16px;
          }
          .header h1 {
            margin: 0;
            font-size: 13pt;
            font-weight: 700;
            letter-spacing: 0.01em;
          }
          .header p {
            margin: 6px 0 0;
            font-size: 10pt;
            color: #c7d2fe;
          }
          .employee { 
            page-break-inside: avoid;
            break-inside: avoid;
            padding: 12px 14px; 
            border: 1px solid #e2e8f0; 
            background: #ffffff;
            flex-shrink: 0;
            margin-bottom: 14px;
            border-radius: 14px;
            max-width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          }
          .document { 
            margin-bottom: 8px; 
            padding: 8px 10px; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            background: #f9fafb;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }
          .document-title { 
            font-weight: 600; 
            color: #020617; 
            margin-bottom: 4px;
            font-size: 12pt;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.3;
          }
          h1, h2, h3 { 
            page-break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 0;
          }
          h2 { 
            color: #0f172a; 
            font-size: 12pt; 
            margin-bottom: 4px;
            margin-top: 10px;
            font-weight: 700;
          }
          h3 { 
            color: #334155; 
            font-size: 11pt; 
            margin-top: 8px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          p { 
            margin: 1px 0;
            font-size: 11pt;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.4;
          }
          .stats {
            font-weight: 800;
            font-size: 11pt;
            color: #f97316;
          }
        </style>
        </head>
        <body>
        <div class="pdf-root">
        <div class="pdf-container">
          <div class="header">
            <h1>Prehľad podpisov informačných povinností</h1>
            <p>${employee.name} | ${currentDate}</p>
          </div>
          <div class="employee">
            <h2>${employee.name}</h2>
            <p>${employee.email}</p>
            <p class="stats">${employee.signedCount}/${employee.assignedCount} podpísané</p>
            <h3>Dokumenty (${docs?.length || 0}):</h3>
            ${(docs || []).map((doc: any) => `
              <div class="document">
                <div class="document-title">${(doc.document?.title || 'Dokument').substring(0, 80)}${doc.document?.title && doc.document.title.length > 80 ? '...' : ''}</div>
                <div style="font-size: 11pt; color: #666; margin-bottom: 1px;">
                  Stav: ${doc.status === 'SIGNED' ? '<span style="color: #16a34a; font-weight: 600;">✓ Podpísané</span>' : '⏰ Čaká na podpis'}
                </div>
                <div style="font-size: 11pt; color: #666;">
                  Priradené: ${new Date(doc.created_at).toLocaleDateString('sk-SK')}${doc.signed_at ? ' | Podpísané: ' + new Date(doc.signed_at).toLocaleDateString('sk-SK') : ''}
                </div>
              </div>
            `).join('') || '<p style="color: #666; font-style: italic;">Žiadne dokumenty</p>'}
          </div>
        </div>
        </div>
        </body>
        </html>
      `;

      const opt = {
        margin: 10,
        filename: `podpisy-${employee.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.3,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          precision: 16
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        font: { size: 11 }
      };

      await html2pdf().set(opt).from(pdfContent).save();
      
      showToast('PDF pre zamestnanca úspešne vygenerované', 'success');
    } catch (error: any) {
      showToast('Chyba pri generovaní PDF: ' + error.message, 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto text-left text-slate-900">
      {/* HLAVIČKA - IDENTICKÁ SO SETTINGS VIEW */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-1 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Dokumenty</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Hromadné priradenie dokumentov na podpis.</p>
        </div>

        {/* INFORMAČNÝ BOX - KOMPAKTNÝ PY-7 PX-8 */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-y-3">
              {[
                { t: "Priraďte dokument na podpis vybraným zamestnancom", i: <Users size={16}/> },
                { t: "Sledujte prehľad o stave oboznámenia", i: <Eye size={16}/> },
                { t: "Systém eviduje, kedy bol dokument podpísaný", i: <CheckCircle2 size={16}/> },
                { t: "Možnosť dokument neskôr zmazať alebo nahradiť iným", i: <Trash2 size={16}/> }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group/item">
                  <div className="w-6 h-6 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange shrink-0 group-hover/item:bg-brand-orange group-hover/item:text-white transition-all">
                    {item.i}
                  </div>
                  <span className="text-sm font-medium text-slate-600">{item.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-10">
        {/* SEKČIA NAHRÁVANIA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
               <Upload size={18} className="text-brand-orange" />
             </div>
             <h2 className="text-lg font-semibold text-white">Nové priradenie dokumentu</h2>
          </div>

          <div className="p-10 grid lg:grid-cols-2 gap-12 text-left">
            <div className="space-y-8 text-left">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700 mb-2 block text-left">Názov dokumentu</label>
                <input type="text" placeholder="Napr. Bezpečnostná smernica 2026" value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="relative group text-left">
                <label className="text-sm font-medium text-slate-700 mb-2 block text-left">Priložiť súbor</label>
                <div className="relative">
                  <input type="file" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      if (!fileTitle) setFileTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                    }
                  }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${selectedFile ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 group-hover:border-[#00427a]/30'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${selectedFile ? 'bg-brand-orange text-white shadow-lg' : 'bg-brand-orange/10 text-brand-orange shadow-sm'}`}>
                      {selectedFile ? <FileCheck2 size={22} /> : <Upload size={22} />}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{selectedFile ? selectedFile.name : 'Potiahnite dokument sem'}</p>
                    <p className="text-xs text-slate-500 mt-1">Podpora PDF, Word, XML a iné (max 15MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between text-left">
                <label className="text-sm font-medium text-slate-700 text-left">Adresáti ({selectedEmps.length})</label>
                <button onClick={() => setSelectedEmps(selectedEmps.length === employees.length ? [] : employees.map(e => e.id!))} className="text-sm font-medium text-slate-600 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all">
                  {selectedEmps.length === employees.length ? 'Zrušiť výber' : 'Označiť všetkých'}
                </button>
              </div>
              <div className="relative mb-2 text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Hľadať zamestnanca..." value={empSelectionSearch} onChange={(e) => setEmpSelectionSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="border border-slate-100 rounded-[2rem] overflow-hidden max-h-[250px] overflow-y-auto no-scrollbar bg-slate-50/20 text-left">
                {employees.filter(e => (e.name||'').toLowerCase().includes(empSelectionSearch.toLowerCase())).map(emp => (
                  <label key={emp.id} className={`flex items-center justify-between px-6 py-4 cursor-pointer border-b border-slate-50 last:border-0 transition-all ${selectedEmps.includes(emp.id!) ? 'bg-blue-50/40' : 'hover:bg-white'}`}>
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedEmps.includes(emp.id!) ? 'bg-[#00427a] border-[#00427a]' : 'bg-white border-slate-300'}`}>
                         {selectedEmps.includes(emp.id!) && <Check size={14} className="text-white" strokeWidth={4} />}
                      </div>
                      <input type="checkbox" className="hidden" checked={selectedEmps.includes(emp.id!)} onChange={() => {
                          if (selectedEmps.includes(emp.id!)) setSelectedEmps(selectedEmps.filter(id => id !== emp.id));
                          else setSelectedEmps([...selectedEmps, emp.id!]);
                        }} />
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-medium text-slate-900 text-left">{emp.name}</p>
                        <p className="text-xs text-slate-500 text-left">{emp.email}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="pt-4 flex items-center justify-end text-left">
                <button onClick={handleUpload} disabled={isUploading || !selectedFile || selectedEmps.length === 0} className="bg-slate-700 text-white px-10 py-4 rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-30">
                  {isUploading ? <RefreshCw className="animate-spin" size={16} /> : <FileCheck2 size={16} />}
                  Priradiť k podpisu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MONITORING PODPISOV */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left" ref={reportRef}>
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
             <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <Users size={18} className="text-brand-orange" />
                </div>
                <h2 className="text-lg font-semibold text-white">Prehľad podpisov podľa zamestnancov</h2>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => exportToPDF()} 
                 disabled={isExportingPDF}
                 className="bg-brand-orange text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-brand-orange/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isExportingPDF ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                 Export PDF
               </button>
             </div>
          </div>
          <div className="p-6 border-b border-slate-50 bg-white text-left">
               <div className="relative w-full md:w-96 text-left">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${searchLoading ? 'text-brand-orange animate-pulse' : 'text-slate-400'}`} size={16} />
                  <input type="text" placeholder="Hľadať zamestnanca..." value={monitorSearch} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  {searchLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
               </div>
          </div>
          <div className={`divide-y divide-slate-100 ${groupedMonitor.length === 0 ? 'min-h-[300px]' : ''}`}>
            {groupedMonitor.map(emp => {
              const isDone = emp.signedCount === emp.assignedCount;
              const isCritical = emp.signedCount === 0 || (emp.signedCount / emp.assignedCount) < 0.5;
              return (
                <div key={emp.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => handleOpenDetail(emp)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 uppercase shadow-sm group-hover:bg-brand-orange group-hover:text-white transition-all">{emp.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">{emp.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">{emp.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{emp.assignedCount} dokumentov</span>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        isDone ? 'bg-emerald-100 text-emerald-700' : 
                        isCritical ? 'bg-rose-100 text-rose-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {isDone ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                        <span>{emp.signedCount}/{emp.assignedCount}</span>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-sm transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Tlačidlo na načítanie viac priradení */}
          {hasMoreAssignments && groupedMonitor.length >= 50 && (
            <div className="p-6 text-center">
              <button
                onClick={loadMoreAssignments}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition-colors"
              >
                Načítať viac záznamov
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedEmployeeDetail && (
        <div className="fixed inset-0 z-[40000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 text-left">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedEmployeeDetail(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-left">
             <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-5">
                   <div>
                      <h2 className="text-2xl font-semibold text-white">{selectedEmployeeDetail.name}</h2>
                      <p className="text-sm text-white/60 flex items-center gap-2 mt-1"><History size={14} className="text-brand-orange" /> Súpis priradených dokumentov</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                        <p className="text-sm text-white/80">Priradené</p>
                        <p className="text-lg font-bold text-white">{selectedEmployeeDetail.assignedCount}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                        <p className="text-sm text-white/80">Podpísané</p>
                        <p className="text-lg font-bold text-white">{selectedEmployeeDetail.signedCount}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                        <p className="text-sm text-white/80">Čakajúce</p>
                        <p className="text-lg font-bold text-white">{selectedEmployeeDetail.assignedCount - selectedEmployeeDetail.signedCount}</p>
                      </div>
                   </div>
                 <button onClick={() => setSelectedEmployeeDetail(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center"><X size={20}/></button>
             </div>

             <div className="p-8 overflow-y-auto no-scrollbar space-y-4 flex-1 bg-slate-50/30">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                   {/* Filtre dokumentov */}
                   <div className="bg-slate-50 rounded-xl p-4 mb-2 border border-slate-200">
                     <div className="flex flex-col lg:flex-row gap-6">
                       <div className="flex flex-col gap-3">
                         <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Typ dokumentu</label>
                         <div className="flex gap-2">
                           <button
                             onClick={() => setDocumentFilter('all')}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                             documentFilter === 'all' 
                               ? 'bg-brand-orange text-white shadow-md' 
                               : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                           }`}
                           >
                             Všetky
                           </button>
                           <button
                             onClick={() => setDocumentFilter('specific')}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                               documentFilter === 'specific' 
                                 ? 'bg-brand-orange text-white shadow-md' 
                                 : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                           }`}
                           >
                             Konkrétny typ
                           </button>
                           <button
                             onClick={() => setDocumentFilter('other')}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                               documentFilter === 'other' 
                                 ? 'bg-brand-orange text-white shadow-md' 
                                 : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                           }`}
                           >
                             Iné dokumenty
                           </button>
                         </div>
                       </div>
                       
                       <div className="flex flex-col gap-3">
                         <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Stav dokumentu</label>
                         <div className="flex gap-2">
                           <button
                             onClick={() => setStatusFilter('all')}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                               statusFilter === 'all' 
                                 ? 'bg-brand-orange text-white shadow-md' 
                                 : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                           }`}
                           >
                             Všetky
                           </button>
                           <button
                             onClick={() => setStatusFilter('signed')}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                               statusFilter === 'signed' 
                                 ? 'bg-emerald-500 text-white shadow-md' 
                                 : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                           }`}
                           >
                             Podpísané
                           </button>
                           <button
                             onClick={() => setStatusFilter('pending')}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                               statusFilter === 'pending' 
                                 ? 'bg-amber-500 text-white shadow-md' 
                                 : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                           }`}
                           >
                             Čakajúce
                           </button>
                         </div>
                       </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-200">
                       <p className="text-sm text-slate-600 font-medium">
                         Zobrazené: {filteredDocs.length} z {selectedEmployeeDetail.assignedCount} dokumentov
                       </p>
                     </div>
                   </div>
                </div>

                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-brand-orange" size={40} />
                    <p className="text-sm font-medium text-slate-500">Načítavam dokumenty...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {filteredDocs.length > 0 ? (
                        filteredDocs.map((a: any) => (
                          <div key={a.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between gap-6 mb-4">
                              <div className="space-y-2 flex-1">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${
                                  a.status === 'SIGNED' || a.status === 'ACKNOWLEDGED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {(a.status === 'SIGNED' || a.status === 'ACKNOWLEDGED') ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                                  {(a.status === 'SIGNED' || a.status === 'ACKNOWLEDGED') ? 'Podpísané' : 'Čaká na podpis'}
                                </span>
                                <h4 className="text-lg font-semibold text-slate-900">{a.document?.title}</h4>
                                {/* Zobrazenie typu dokumentu */}
                                <div className="flex items-center gap-2">
                                  {isSpecificDocumentType(a) ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      <FolderOpen size={12} />
                                      {getSpecificDocumentTypeName(a) || 'Konkrétny typ'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                      <FileText size={12} />
                                      Iný dokument
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <button 
                                  onClick={() => handleDownload(a)} 
                                  disabled={downloadingIds.has(a.id)}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border shadow-sm ${
                                    downloadingIds.has(a.id) 
                                      ? 'bg-slate-100 text-slate-300' 
                                      : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20 hover:bg-brand-orange hover:text-white'
                                  }`}
                                  title="Stiahnuť súbor"
                                >
                                  {downloadingIds.has(a.id) ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                                </button>
                                <button onClick={() => setDeleteConfirmId(a)} className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm" title="Zrušiť priradenie">
                                  <Trash2 size={16}/>
                                </button>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  a.status === 'SIGNED' || a.status === 'ACKNOWLEDGED'
                                    ? 'bg-emerald-100 text-emerald-600 border border-emerald-100' 
                                    : 'bg-amber-100 text-amber-700 border border-amber-100'
                                }`}>
                                  {(a.status === 'SIGNED' || a.status === 'ACKNOWLEDGED') ? <Check size={20} strokeWidth={3}/> : <PenTool size={20}/>}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Clock size={16} className="text-slate-500"/>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wider">Priradené</p>
                                  <p className="text-sm font-medium text-slate-900">{new Date(a.created_at).toLocaleDateString('sk-SK')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                  <CheckCircle2 size={16} className="text-emerald-600"/>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wider">Podpísané dňa</p>
                                  <p className={`text-sm font-medium ${a.signed_at ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                                    {a.signed_at ? new Date(a.signed_at).toLocaleDateString('sk-SK') : '—'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} className="text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">Žiadne dokumenty nevyhovujú filtrám</p>
                          <p className="text-slate-400 text-sm mt-1">Skúte zmeniť filtre pre zobrazenie dokumentov</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
             </div>

             <div className="p-6 bg-white border-t border-slate-200 flex justify-center shrink-0">
                <button onClick={() => setSelectedEmployeeDetail(null)} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all">Zavrieť detail</button>
             </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
           <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)}></div>
           <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 animate-in zoom-in-95 duration-300 text-left">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-sm"><AlertTriangle size={40} /></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase text-center">Zrušiť priradenie?</h3>
              <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed text-center">Tento dokument bude natrvalo odstránený zo zoznamu zamestnanca.</p>
              <div className="grid grid-cols-2 gap-4 mt-10 text-left">
                 <button onClick={() => setDeleteConfirmId(null)} className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Ponechať</button>
                 <button onClick={() => handleDeleteAssignment(deleteConfirmId)} className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all">Áno, odstrániť</button>
              </div>
           </div>
        </div>
      )}

      {/* DOCUMENT TYPE SELECTION MODAL */}
      {documentTypeModal && (
        <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setDocumentTypeModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto">
                <FileText size={32} className="text-brand-orange" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900">Aký typ dokumentu?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Vyberte, ako chcete priradiť tento dokument.
                </p>
              </div>
              
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => handleDocumentTypeSelect('specific')}
                  className="w-full px-6 py-4 bg-brand-orange text-white rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
                >
                  <FolderOpen size={20} />
                  <span>Konkrétny typ dokumentu</span>
                </button>
                
                <button
                  onClick={() => handleDocumentTypeSelect('other')}
                  className="w-full px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                >
                  <FileText size={20} />
                  <span>Iný dokument</span>
                </button>
                
                <button
                  onClick={() => setDocumentTypeModal(false)}
                  className="w-full px-6 py-3 text-slate-500 hover:text-slate-700 transition-all font-medium"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPECIFIC DOCUMENT TYPE SELECTION MODAL */}
      {specificTypeModal && (
        <div className="fixed inset-0 z-[50001] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSpecificTypeModal(false)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="overflow-y-auto max-h-[65vh]">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto">
                  <FolderOpen size={32} className="text-brand-orange" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-900">Vyberte typ dokumentu</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Vyberte konkrétny typ dokumentu z kategórií nižšie.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {Object.entries(documentCategories).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="space-y-4">
                    <div className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                      {category.icon}
                      {category.name}
                    </div>
                    
                    <div className="space-y-6 ml-8">
                      {category.directTypes && (
                        <div className="grid grid-cols-1 gap-2">
                          {category.directTypes.map(type => (
                            <button
                              key={type.id}
                              onClick={() => handleSpecificTypeSelect(type.id, type.name)}
                              className="text-left p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-brand-orange/5 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 group-hover:text-brand-orange">
                                  {type.name}
                                </span>
                                <ChevronRight size={16} className="text-slate-400 group-hover:text-brand-orange transition-colors" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {category.types && (
                        <div className="grid grid-cols-1 gap-2">
                          {category.types.map(type => (
                            <button
                              key={type.id}
                              onClick={() => handleSpecificTypeSelect(type.id, type.name)}
                              className="text-left p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-brand-orange/5 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 group-hover:text-brand-orange">
                                  {type.name}
                                </span>
                                <ChevronRight size={16} className="text-slate-400 group-hover:text-brand-orange transition-colors" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {category.subsections?.map(subsection => (
                        <div key={subsection.name} className="space-y-3">
                          <h4 className="text-sm font-medium text-slate-700 uppercase tracking-wider">
                            {subsection.name}
                          </h4>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {subsection.types.map(type => (
                              <button
                                key={type.id}
                                onClick={() => handleSpecificTypeSelect(type.id, type.name)}
                                className="text-left p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-brand-orange/5 transition-all group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-700 group-hover:text-brand-orange">
                                    {type.name}
                                  </span>
                                  <ChevronRight size={16} className="text-slate-400 group-hover:text-brand-orange transition-colors" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setSpecificTypeModal(false)}
                  className="w-full px-6 py-3 text-slate-500 hover:text-slate-700 transition-all font-medium"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SPECIFIC TYPE MODAL */}
      {confirmSpecificModal && (
        <div className="fixed inset-0 z-[50002] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setConfirmSpecificModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto">
                <FolderOpen size={32} className="text-brand-orange" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900">Naozaj chcete priradiť dokument?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Dokument <strong>"{fileTitle}"</strong> bude priradený ako:
                </p>
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-3">
                  <p className="font-semibold text-brand-orange">{confirmTypeName}</p>
                </div>
                <p className="text-sm text-slate-500">
                  Pre {selectedEmps.length} {selectedEmps.length === 1 ? 'zamestnanca' : 'zamestnancov'}
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setConfirmSpecificModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 hover:text-slate-700 transition-all font-medium"
                >
                  Zrušiť
                </button>
                <button
                  onClick={confirmSpecificType}
                  className="flex-1 px-4 py-3 rounded-lg bg-brand-orange text-white font-medium hover:bg-orange-600 transition-all"
                >
                  Áno, priradiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT PDF MODAL */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-[50003] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setExportModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="overflow-y-auto max-h-[75vh]">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto">
                  <FileDown size={32} className="text-brand-orange" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-900">Nastavenie exportu PDF</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Vyberte, čo chcete exportovať do PDF súboru.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {/* Výber zamestnancov */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900">Zamestnanci</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="employeeSelection"
                        checked={exportAllEmployees}
                        onChange={() => setExportAllEmployees(true)}
                        className="w-4 h-4 text-brand-orange border-slate-300 focus:ring-brand-orange"
                      />
                      <span className="text-sm font-medium text-slate-700">Všetci zamestnanci ({groupedMonitor.length})</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="employeeSelection"
                        checked={!exportAllEmployees}
                        onChange={() => setExportAllEmployees(false)}
                        className="w-4 h-4 text-brand-orange border-slate-300 focus:ring-brand-orange"
                      />
                      <span className="text-sm font-medium text-slate-700">Vybraní zamestnanci</span>
                    </label>
                  </div>
                  
                  {!exportAllEmployees && (
                    <div className="space-y-3">
                      {/* Vyhľadávanie v zamestnancoch */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Hľadať zamestnanca..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                        />
                      </div>
                      
                      {/* Počet vybraných a rýchle akcie */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-sm font-medium text-slate-700">
                          Vybraných: <span className="text-brand-orange font-bold">{selectedEmployeesForExport.length}</span> z {groupedMonitor.length}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedEmployeesForExport(groupedMonitor.map(emp => emp.id))}
                            className="text-xs px-3 py-1 bg-brand-orange text-white rounded-md hover:bg-orange-600 transition-colors"
                          >
                            Označiť všetkých
                          </button>
                          <button
                            onClick={() => setSelectedEmployeesForExport([])}
                            className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
                          >
                            Odznačiť všetkých
                          </button>
                        </div>
                      </div>
                      
                      {/* Zoznam zamestnancov s lepším designom */}
                      <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto bg-white">
                        <div className="grid grid-cols-1 divide-y divide-slate-100">
                          {groupedMonitor.map(emp => (
                            <label 
                              key={emp.id} 
                              className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedEmployeesForExport.includes(emp.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEmployeesForExport([...selectedEmployeesForExport, emp.id]);
                                  } else {
                                    setSelectedEmployeesForExport(selectedEmployeesForExport.filter(id => id !== emp.id));
                                  }
                                }}
                                className="w-4 h-4 text-brand-orange border-slate-300 rounded focus:ring-2 focus:ring-brand-orange focus:ring-offset-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-900 truncate">{emp.name}</span>
                                  <span className="text-xs text-slate-500">({emp.signedCount}/{emp.assignedCount})</span>
                                </div>
                                <span className="text-xs text-slate-500 truncate block">{emp.email}</span>
                              </div>
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                emp.signedCount === emp.assignedCount 
                                  ? 'bg-emerald-500' 
                                  : emp.signedCount === 0 
                                    ? 'bg-rose-500' 
                                    : 'bg-amber-500'
                              }`} title={`${emp.signedCount}/${emp.assignedCount} podpísané`}></div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Filtre dokumentov */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900">Filtre dokumentov</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Typ dokumentu */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Typ dokumentu</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'Všetky' },
                          { value: 'specific', label: 'Konkrétny typ' },
                          { value: 'other', label: 'Iné dokumenty' }
                        ].map(option => (
                          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="documentType"
                              value={option.value}
                              checked={exportDocumentFilter === option.value}
                              onChange={(e) => setExportDocumentFilter(e.target.value as any)}
                              className="w-4 h-4 text-brand-orange border-slate-300 focus:ring-brand-orange"
                            />
                            <span className="text-sm text-slate-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Stav dokumentu */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Stav dokumentu</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'Všetky' },
                          { value: 'signed', label: 'Podpísané' },
                          { value: 'pending', label: 'Čakajúce' }
                        ].map(option => (
                          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="documentStatus"
                              value={option.value}
                              checked={exportStatusFilter === option.value}
                              onChange={(e) => setExportStatusFilter(e.target.value as any)}
                              className="w-4 h-4 text-brand-orange border-slate-300 focus:ring-brand-orange"
                            />
                            <span className="text-sm text-slate-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Kategória dokumentu */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Kategória dokumentu</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="documentCategory"
                            value="all"
                            checked={exportCategoryFilter === 'all'}
                            onChange={(e) => setExportCategoryFilter(e.target.value)}
                            className="w-4 h-4 text-brand-orange border-slate-300 focus:ring-brand-orange"
                          />
                          <span className="text-sm text-slate-700">Všetky kategórie</span>
                        </label>
                        {Object.entries(documentCategories).map(([categoryKey, category]) => (
                          <label key={categoryKey} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="documentCategory"
                              value={categoryKey}
                              checked={exportCategoryFilter === categoryKey}
                              onChange={(e) => setExportCategoryFilter(e.target.value)}
                              className="w-4 h-4 text-brand-orange border-slate-300 focus:ring-brand-orange"
                            />
                            <span className="text-sm text-slate-700">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setExportModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 hover:text-slate-700 transition-all font-medium"
                  >
                    Zrušiť
                  </button>
                  <button
                    onClick={performExport}
                    disabled={isExportingPDF || (!exportAllEmployees && selectedEmployeesForExport.length === 0)}
                    className="flex-1 px-6 py-3 rounded-lg bg-brand-orange text-white font-medium hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isExportingPDF ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    Exportovať PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* INFO MODAL */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-[50004] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setInfoModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-7xl max-h-[92vh] rounded-2xl shadow-xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Info size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-normal text-white">Kompletný sprievodca priraďovaním dokumentov</h3>
                  </div>
                </div>
                <button
                  onClick={() => setInfoModalOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                {/* Introduction */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <p className="text-slate-700 leading-relaxed text-lg">
                    Táto sekcia umožňuje <span className="text-brand-orange font-semibold">hromadné priraďovanie dokumentov</span> zamestnancom na digitálny podpis. 
                    Podporujeme dva rôzne typy priraďovania podľa povahy dokumentu a vašich potrieb.
                  </p>
                </div>

                {/* Document Types */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                      <FolderOpen size={18} className="text-brand-orange" />
                    </div>
                    Typy priraďovania dokumentov
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                          <FolderOpen size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-lg font-bold text-slate-900 mb-3">Konkrétny typ dokumentu</h5>
                          <p className="text-slate-600 text-sm leading-relaxed mb-4">
                            Špecializované GDPR dokumenty s automatickou kategorizáciou. Systém triedi dokumenty podľa legislatívnych požiadaviek.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                              <span className="text-slate-600 text-sm">Informačné povinnosti zamestnancov</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                              <span className="text-slate-600 text-sm">Súhlasy so spracúvaním údajov</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                              <span className="text-slate-600 text-sm">Oprávnenia a prístupy</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                              <span className="text-slate-600 text-sm">Interné smernice a protokoly</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-2xl p-6 border border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={24} className="text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-lg font-bold text-slate-900 mb-3">Iné dokumenty</h5>
                          <p className="text-slate-600 text-sm leading-relaxed mb-4">
                            Všeobecné dokumenty bez špecifickej GDPR kategorizácie. Ideálne pre interné a administratívne dokumenty.
                          </p>
                          {selectedEmployeeDetail?.docs?.some(doc => !doc.document?.document_type_id) && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-slate-600 text-sm">Hmotná zodpovednosť</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-slate-600 text-sm">Pracovné zákazky</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-slate-600 text-sm">Interné smernice</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-slate-600 text-sm">Ostatné dokumenty</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                      <Zap size={18} className="text-brand-orange" />
                    </div>
                    Ako to funguje
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { 
                        step: '1', 
                        title: 'Vyberte súbor', 
                        desc: 'Nahrajte dokument a zadajte jeho názov',
                        icon: <Upload size={20} />
                      },
                      { 
                        step: '2', 
                        title: 'Vyberte zamestnancov', 
                        desc: 'Označte všetkých alebo vybraných zamestnancov',
                        icon: <Users size={20} />
                      },
                      { 
                        step: '3', 
                        title: 'Zvoľte typ', 
                        desc: 'Konkrétny GDPR typ alebo všeobecný dokument',
                        icon: <FolderOpen size={20} />
                      },
                      { 
                        step: '4', 
                        title: 'Potvrďte', 
                        desc: 'Sledujte stavy podpisov v reálnom čase',
                        icon: <CheckCircle2 size={20} />
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-orange">
                          {item.icon}
                        </div>
                        <p className="text-brand-orange font-semibold mb-1">Krok {item.step}</p>
                        <h5 className="text-slate-900 font-semibold mb-2">{item.title}</h5>
                        <p className="text-slate-600 text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternative approach */}
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 shadow-lg">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                        <AlertTriangle size={32} className="text-white" />
                      </div>
                      <div className="text-left">
                        <h5 className="text-2xl font-bold text-slate-900 mb-2">Alternatívny prístup</h5>
                        <p className="text-slate-700 leading-relaxed">
                          Pre priradenie <span className="text-brand-orange font-semibold">viacerých dokumentov naraz jednému zamestnancovi</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left space-y-4">
                      <h6 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                        Postup:
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
                          <div className="flex-1">
                            <p className="text-brand-orange font-semibold mb-1">Krok 1</p>
                            <p className="font-semibold text-slate-900 mb-2 text-lg">Správa zamestnancov</p>
                            <p className="text-slate-600">V hlavnom menu vyberte "Správa zamestnancov"</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
                          <div className="flex-1">
                            <p className="text-brand-orange font-semibold mb-1">Krok 2</p>
                            <p className="font-semibold text-slate-900 mb-2 text-lg">Detail zamestnanca</p>
                            <p className="text-slate-600">Kliknite na meno zamestnanca v zozname</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
                          <div className="flex-1">
                            <p className="text-brand-orange font-semibold mb-1">Krok 3</p>
                            <p className="font-semibold text-slate-900 mb-2 text-lg">GDPR dokumenty</p>
                            <p className="text-slate-600">V profile zamestnanca vyberte záložku "GDPR dokumenty"</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
                          <div className="flex-1">
                            <p className="text-brand-orange font-semibold mb-1">Krok 4</p>
                            <p className="font-semibold text-slate-900 mb-2 text-lg">Hromadné nahrávanie</p>
                            <p className="text-slate-600">Pridajte viacero dokumentov naraz</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                      <BarChart3 size={18} className="text-brand-orange" />
                    </div>
                    Sledovanie a správa
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                        <Eye size={20} className="text-emerald-600" />
                      </div>
                      <h5 className="text-slate-900 font-semibold mb-2">Prehľad podpisov</h5>
                      <p className="text-slate-600 text-sm">V reálnom čase sledujte, ktorí zamestnanci už podpísali a ktorí čakajú na podpis.</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <Download size={20} className="text-blue-600" />
                      </div>
                      <h5 className="text-slate-900 font-semibold mb-2">Stiahnutie dokumentov</h5>
                      <p className="text-slate-600 text-sm">Kliknutím stiahnite akýkoľvek priradený dokument v pôvodnej podobe.</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <FileText size={20} className="text-purple-600" />
                      </div>
                      <h5 className="text-slate-900 font-semibold mb-2">PDF export</h5>
                      <p className="text-slate-600 text-sm">Exportujte kompletný prehľad podpisov do PDF pre reporting alebo archiváciu.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFO BUTTON - FIXED IN BOTTOM RIGHT */}
      <button
        onClick={() => setInfoModalOpen(true)}
        className="fixed bottom-6 right-0 w-8 h-8 bg-brand-orange text-white rounded-l-lg flex items-center justify-center shadow-lg transition-all duration-300 z-[30000] group hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-125"
        title="Pomocník - ako obsluhovať túto sekciu"
      >
        <span className="text-lg font-bold group-hover:scale-110 transition-transform duration-300">?</span>
      </button>
    </div>
  );
};

export default IPManagementView;
