import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, Clock, AlertCircle, Search, Filter, Plus, Trash2, Download, FolderOpen, Shield, PenTool, Key, FileCheck, User, BookOpen, Ban, UserX, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  position?: string;
}

interface DocumentType {
  id: string;
  name: string;
  category: string;
  description: string;
  required: boolean;
  file_path?: string;
}

interface AssignedDocument {
  id: string;
  employee_id: string;
  document_type_id: string;
  document_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  assigned_at: string;
  acknowledged_at?: string;
  status: 'pending' | 'acknowledged' | 'rejected' | 'expired';
  notes?: string;
}

const EmployeeDocumentsView: React.FC<{
  employee: Employee;
  onBack: () => void;
}> = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [assignedDocuments, setAssignedDocuments] = useState<AssignedDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: any[]}>({});
  const [uploading, setUploading] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  // Definícia kategórií dokumentov s hlavnými sekciami a podsekciami
  const documentCategories = {
    gdpr: {
      name: 'Informácie o spracúvaní osobných údajov',
      icon: <Shield size={20} />,
      subsections: [
        {
          name: 'Dokumenty',
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
      icon: <PenTool size={20} />,
      subsections: [
        {
          name: 'Dokumenty',
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
      icon: <FileCheck size={20} />,
      subsections: [
        {
          name: 'Dokumenty',
          types: [
            { id: 'protocol_activities', name: 'Preberací protokol k aktívam', category: 'protocols', required: true },
            { id: 'protocol_access_resources', name: 'Preberací protokol k prístupovým prostriedkom', category: 'protocols', required: true }
          ]
        }
      ]
    },
    authorized_persons_docs: {
      name: 'Dokumenty pre oprávnené osoby',
      icon: <User size={20} />,
      subsections: [
        {
          name: 'Dokumenty',
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
          name: 'Dokumenty',
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
      icon: <Ban size={20} />,
      subsections: [
        {
          name: 'Dokumenty',
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

  useEffect(() => {
    loadDocumentTypes();
    loadAssignedDocuments();
  }, [employee.id]);

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Funkcia na získanie názvu súboru z path
  const getFileNameFromPath = (path: string) => {
    const parts = path.split('_');
    // Path format: employeeId_typeId_timestamp_filename
    // Zoberieme všetko po timestamp (posledné 3 časti)
    if (parts.length >= 4) {
      return parts.slice(3).join('_');
    }
    return path;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, typeId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    try {
      setUploading(prev => [...prev, typeId]);
      
      // Nahrať súbor do Supabase Storage
      const fileName = `${employee.id}_${typeId}_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) {
        console.error('Chyba pri nahrávaní súboru:', error);
        showNotification('error', 'Chyba pri nahrávaní', error.message);
        return;
      }

      // Získať public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Pridať súbor do state (vrátame si aj file_path a original name)
      setUploadedFiles(prev => ({
        ...prev,
        [typeId]: [...(prev[typeId] || []), { 
          ...file, 
          path: fileName, 
          url: publicUrl,
          originalName: file.name 
        }]
      }));

      console.log('Súbor úspešne nahraný:', publicUrl);
      showNotification('success', 'Súbor nahraný', `${file.name} bol úspešne nahraný do systému.`);
      
    } catch (error) {
      console.error('Chyba:', error);
      showNotification('error', 'Chyba systému', 'Došlo k neočakávanej chybe pri nahrávaní súboru.');
    } finally {
      setUploading(prev => prev.filter(id => id !== typeId));
    }
  };

  const triggerFileInput = (typeId: string) => {
    const input = document.getElementById(`file-input-${typeId}`) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  // Funkcia na spočítanie všetkých nahraných súborov
  const getTotalUploadedFiles = () => {
    return Object.values(uploadedFiles).reduce((total: number, files: any[]) => total + files.length, 0);
  };

  const loadDocumentTypes = async () => {
    try {
      // Vytvoríme plochý zoznam všetkých typov dokumentov z nového štruktúrovaného formátu
      const allTypes: DocumentType[] = [];
      
      Object.entries(documentCategories).forEach(([categoryKey, category]) => {
        category.subsections.forEach(subsection => {
          subsection.types.forEach(type => {
            allTypes.push({
              ...type,
              description: `${category.name} > ${subsection.name}`
            });
          });
        });
      });
      
      setDocumentTypes(allTypes);
    } catch (error) {
      console.error('Chyba pri načítaní typov dokumentov:', error);
    }
  };

  const loadAssignedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employee.id)
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      setAssignedDocuments(data || []);
    } catch (error) {
      console.error('Chyba pri načítaní priradených dokumentov:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDocuments = async () => {
    try {
      // Získaj všetky nahrané súbory a vytvor záznamy v databáze
      const assignments: any[] = [];
      
      Object.entries(uploadedFiles).forEach(([typeId, files]) => {
        if (Array.isArray(files)) {
          files.forEach(file => {
            console.log('File object:', file); // Debug log
            console.log('File originalName:', file.originalName); // Debug log
            console.log('File path:', file.path); // Debug log
            
            assignments.push({
              employee_id: employee.id,
              document_type_id: typeId,
              document_name: file.originalName || getFileNameFromPath(file.path) || 'Unknown Document',
              file_path: file.path || `${employee.id}_${typeId}_${Date.now()}_file`,
              file_size: file.size || 0,
              mime_type: file.type || 'application/octet-stream',
              assigned_at: new Date().toISOString(),
              status: 'pending'
            });
          });
        }
      });

      if (assignments.length === 0) {
        showNotification('error', 'Žiadne dokumenty', 'Nemáte žiadne nahrané dokumenty na priradenie.');
        return;
      }

      const { error } = await supabase
        .from('employee_documents')
        .insert(assignments);

      if (error) throw error;
      
      await loadAssignedDocuments();
      setAssignModalOpen(false);
      setUploadedFiles({}); // Vyčistiť nahrané súbory po priradení
      showNotification('success', 'Dokumenty priradené', `${assignments.length} dokumentov bolo úspešne priradených zamestnancovi.`);
    } catch (error) {
      console.error('Chyba pri priraďovaní dokumentov:', error);
      showNotification('error', 'Chyba pri priraďovaní', 'Došlo k chybe pri priraďovaní dokumentov zamestnancovi.');
    }
  };

  const handleAcknowledgeDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;
      
      setAssignedDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'acknowledged', acknowledged_at: new Date().toISOString() }
            : doc
        )
      );
    } catch (error) {
      console.error('Chyba pri potvrdzovaní dokumentu:', error);
    }
  };

  // Funkcia na získanie názvu dokumentu z document_type_id
  const getDocumentName = (typeId: string) => {
    const document = documentTypes.find(doc => doc.id === typeId);
    return document ? document.name : typeId;
  };

  const getDocumentCategory = (typeId: string) => {
    const document = documentTypes.find(doc => doc.id === typeId);
    return document ? document.category : 'unknown';
  };

  const filteredDocuments = assignedDocuments.filter(doc => {
    const matchesSearch = doc.document_type_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || doc.document_type_id === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusIcon = (doc: AssignedDocument) => {
    if (doc.status === 'acknowledged') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusText = (doc: AssignedDocument) => {
    if (doc.status === 'acknowledged') {
      return 'Potvrdené';
    } else {
      return 'Čaká na potvrdenie';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Header Section with Assign Button */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
            <FolderOpen size={18} className="text-brand-orange" />
          </div>
          <h2 className="text-lg font-semibold text-white">Priradené dokumenty</h2>
        </div>
        <button
          onClick={() => setAssignModalOpen(true)}
          className="flex items-center px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Priradiť dokumenty
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Hľadať dokumenty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Načítavam dokumenty...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priradené dokumenty</h3>
            
            {Object.entries(documentCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    {category.icon} {category.name}
                  </h4>
                </div>
                <div className="space-y-3">
                  {category.subsections.map(subsection => (
                    <div key={subsection.name} className="ml-4 border-l-2 border-gray-300 pl-4">
                      {categoryKey === 'access' && (
                        <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
                          {subsection.name === 'Neoprávnené osoby' && <UserX size={16} className="text-red-500" />}
                          {subsection.name === 'Oprávnené osoby' && <UserCheck size={16} className="text-green-500" />}
                          {subsection.name === 'Oprávnenia' && <Key size={16} className="text-blue-500" />}
                          {subsection.name}
                        </h5>
                      )}
                      <div className="space-y-2">
                        {subsection.types.map(type => {
                          // Nájdi priradené dokumenty pre tento typ
                          const assignedDocs = assignedDocuments.filter(doc => doc.document_type_id === type.id);
                          
                          return (
                            <div key={type.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">{type.name}</span>
                                  {assignedDocs.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200">
                                      {assignedDocs.length} {assignedDocs.length === 1 ? 'dokument' : 'dokumenty'}
                                    </span>
                                  )}
                                </div>
                                
                                {assignedDocs.length > 0 ? (
                                  <div className="mt-2 space-y-2">
                                    {assignedDocs.map(doc => (
                                      <div key={doc.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-3 flex-1">
                                          <FileText size={12} className="text-gray-400 flex-shrink-0" />
                                          <span className="text-gray-700 font-medium">{doc.document_name}</span>
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 transition-all duration-300 ${
                                            doc.status === 'acknowledged' 
                                              ? 'text-green-600 bg-green-50 border border-green-200' 
                                              : 'text-orange-600 bg-orange-50 border border-orange-200'
                                          }`}>
                                            {doc.status === 'acknowledged' ? (
                                              <>
                                                <CheckCircle size={10} />
                                                Podpísané
                                              </>
                                            ) : (
                                              <>
                                                <Clock size={10} />
                                                Čaká na podpis
                                              </>
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                          <span className="text-gray-500 whitespace-nowrap">
                                            Priradené: {new Date(doc.assigned_at).toLocaleString('sk-SK', {
                                              day: '2-digit',
                                              month: '2-digit', 
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                          {doc.acknowledged_at && (
                                            <span className="text-gray-500 whitespace-nowrap">
                                              Podpísané: {new Date(doc.acknowledged_at).toLocaleString('sk-SK', {
                                                day: '2-digit',
                                                month: '2-digit', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="mt-2 text-xs text-gray-500 italic">
                                    Žiadny priradený dokument
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Documents Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Priradiť dokumenty zamestnancovi: {employee.full_name}
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(documentCategories).map(([categoryKey, category]) => (
                        <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              {category.icon} {category.name}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {category.subsections.map(subsection => (
                              <div key={subsection.name} className="ml-4 border-l-2 border-gray-300 pl-4">
                                {categoryKey === 'access' && (
                                  <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
                                    {subsection.name === 'Neoprávnené osoby' && <UserX size={16} className="text-red-500" />}
                                    {subsection.name === 'Oprávnené osoby' && <UserCheck size={16} className="text-green-500" />}
                                    {subsection.name === 'Oprávnenia' && <Key size={16} className="text-blue-500" />}
                                    {subsection.name}
                                  </h5>
                                )}
                                <div className="space-y-2">
                                  {subsection.types.map(type => {
                                    const hasFiles = uploadedFiles[type.id] && uploadedFiles[type.id].length > 0;
                                    const isUploading = uploading.includes(type.id);
                                    
                                    return (
                                    <div key={type.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded">
                                      <div className="flex-1 flex items-center gap-2">
                                        <span className="text-sm text-gray-700">{type.name}</span>
                                        {hasFiles && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <FileText size={12} className="mr-1" />
                                            {uploadedFiles[type.id].length}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Skrytý file input */}
                                      <input
                                        id={`file-input-${type.id}`}
                                        type="file"
                                        onChange={(e) => handleFileUpload(e, type.id)}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                      />
                                      
                                      <button
                                        onClick={() => triggerFileInput(type.id)}
                                        disabled={isUploading}
                                        className={`ml-2 p-1 rounded transition-colors ${
                                          isUploading 
                                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                            : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                        title={isUploading ? 'Nahrávanie...' : 'Nahrať dokument'}
                                      >
                                        {isUploading ? (
                                          <div className="animate-spin">
                                            <Upload size={16} />
                                          </div>
                                        ) : (
                                          <Plus size={16} />
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {(() => {
                  const totalUploadedFiles = getTotalUploadedFiles();
                  return (
                    <>
                      <button
                        onClick={() => handleAssignDocuments()}
                        disabled={totalUploadedFiles === 0}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Priradiť ({totalUploadedFiles}) dokumentov
                      </button>
                      <button
                        onClick={() => {
                          setAssignModalOpen(false);
                          setSelectedDocuments([]);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Zrušiť
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifikačný modal */}
      {notification.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
              notification.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
            }`}>
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                  notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                } sm:mx-0 sm:h-10 sm:w-10`}>
                  {notification.type === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className={`text-lg leading-6 font-medium ${
                    notification.type === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {notification.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    notification.type === 'success' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocumentsView;
