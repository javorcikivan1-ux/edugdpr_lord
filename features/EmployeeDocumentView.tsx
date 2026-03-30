import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, CheckCircle, Clock, Download, Eye, PenTool, Shield, Key, FileCheck, User, BookOpen, Ban, UserX, UserCheck } from 'lucide-react';
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

interface EmployeeDocumentViewProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeDocumentView: React.FC<EmployeeDocumentViewProps> = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [assignedDocuments, setAssignedDocuments] = useState<AssignedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<AssignedDocument | null>(null);
  const [signing, setSigning] = useState(false);
  const [consentChecks, setConsentChecks] = useState({
    data_processing: false,
    data_publication: false,
    general_ack: false
  });

  // Rovnaká definícia kategórií ako v EmployeeDocumentsView
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
            { id: 'authorized_data_handling', name: 'Smernica pre manipuláciu s osobnými údajmi', category: 'authorized_persons_docs', required: true }
          ]
        }
      ]
    },
    internal_directives: {
      name: 'Interné pravidlá a pokyny',
      icon: <BookOpen size={20} />,
      subsections: [
        {
          name: 'Interné smernice a riadenie',
          types: [
            { id: 'directive_personnel_security', name: 'Smernica pre riadenie personálnej bezpečnosti', category: 'internal_directives', required: true },
            { id: 'directive_security_incidents', name: 'Smernica pre riadenie bezpečnostných incidentov', category: 'internal_directives', required: true },
            { id: 'directive_activities', name: 'Smernica pre riadenie aktív', category: 'internal_directives', required: true },
            { id: 'directive_rights_exercise', name: 'Smernica pre výkon práv dotknutých osôb', category: 'internal_directives', required: true },
            { id: 'directive_control_activities', name: 'Smernica pre kontrolnú činnosť', category: 'internal_directives', required: true },
            { id: 'directive_camera_system', name: 'Smernica pre kamerový systém', category: 'internal_directives', required: true }
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
            { id: 'revocation_authorized_person', name: 'Záznam o odobratí oprávnenia oprávnené osobe', category: 'revocation', required: false },
            { id: 'revocation_user_access', name: 'Záznam o odobratí používateľských oprávnení', category: 'revocation', required: false },
            { id: 'revocation_system_access', name: 'Záznam o odobratí prístupov do informačných systémov', category: 'revocation', required: false },
            { id: 'revocation_secure_area_access', name: 'Záznam o odobratí oprávnenia na vstup do chráneného priestoru', category: 'revocation', required: false },
            { id: 'handover_access_resources', name: 'Záznam o odovzdaní prístupových prostriedkov', category: 'revocation', required: false },
            { id: 'handover_activities', name: 'Protokol o odovzdaní aktív', category: 'revocation', required: false }
          ]
        }
      ]
    }
  };

  useEffect(() => {
    loadDocumentTypes();
    loadAssignedDocuments();
  }, [employee.id]);

  const loadDocumentTypes = async () => {
    try {
      const allTypes: DocumentType[] = [];
      
      Object.entries(documentCategories).forEach(([categoryKey, category]) => {
        category.subsections.forEach(subsection => {
          subsection.types.forEach(type => {
            allTypes.push({
              ...type,
              description: `${category.name} - ${subsection.name}`
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

  // Funkcia na zistenie, či je to súhlas
  const isConsentDocument = (typeId: string) => {
    const docType = documentTypes.find(type => type.id === typeId);
    return docType?.category === 'consents';
  };

  // Funkcia na získanie názvu dokumentu
  const getDocumentName = (typeId: string) => {
    const document = documentTypes.find(doc => doc.id === typeId);
    return document ? document.name : typeId;
  };

  // Funkcia na stiahnutie dokumentu
  const downloadDocument = async (doc: AssignedDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);
      
      if (error) throw error;
      
      // Vytvorenie blob a stiahnutie
      const blob = new Blob([data], { type: doc.mime_type || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a') as HTMLAnchorElement;
      a.href = url;
      a.download = doc.document_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Chyba pri sťahovaní dokumentu:', error);
    }
  };

  // Funkcia na zobrazenie dokumentu
  const viewDocument = async (doc: AssignedDocument) => {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(doc.file_path);
      
      // Otvoriť v novom okne
      window.open(data.publicUrl, '_blank');
    } catch (error) {
      console.error('Chyba pri zobrazení dokumentu:', error);
    }
  };

  // Funkcia na podpísanie dokumentu
  const signDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      setSigning(true);
      
      const ipAddress = await fetch('https://api.ipify.org?format=json', { 
        cache: 'no-cache',
        mode: 'cors'
      })
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null); // null namiesto 'unknown'

      const userAgent = navigator.userAgent;
      const now = new Date().toISOString();

      // Zistiť typ dokumentu a správnu tabuľku
      const docType = documentTypes.find(type => type.id === selectedDocument.document_type_id);
      const category = docType?.category;
      
      let error = null;
      
      if (isConsentDocument(selectedDocument.document_type_id)) {
        // Súhlasy - uložiť do gdpr_consents
        const result = await supabase
          .from('gdpr_consents')
          .insert({
            employee_document_id: selectedDocument.id,
            consent_type: selectedDocument.document_type_id,
            consent_given: true,
            consent_date: now,
            ...(ipAddress && { ip_address: ipAddress }),
            user_agent: userAgent
          });
        error = result.error;
      } else if (category === 'access') {
        // Prístupy - uložiť do access_permissions
        const result = await supabase
          .from('access_permissions')
          .insert({
            employee_document_id: selectedDocument.id,
            permission_type: selectedDocument.document_type_id,
            access_level: 'acknowledged',
            granted_at: now,
            granted_by: null, // zamestnanec sám potvrdzuje
            is_active: true
          });
        error = result.error;
      } else if (category === 'protocols') {
        // Protokoly - uložiť do handover_protocols
        const result = await supabase
          .from('handover_protocols')
          .insert({
            employee_document_id: selectedDocument.id,
            protocol_type: selectedDocument.document_type_id,
            handover_date: now,
            handed_over_by: null,
            received_by: null // zamestnanec sám potvrdzuje
          });
        error = result.error;
      } else if (category === 'internal_directives') {
        // Interné smernice - uložiť do internal_directives
        const result = await supabase
          .from('internal_directives')
          .insert({
            employee_document_id: selectedDocument.id,
            directive_type: selectedDocument.document_type_id,
            read: true,
            read_date: now,
            understood: true,
            ...(ipAddress && { ip_address: ipAddress }),
            user_agent: userAgent
          });
        error = result.error;
      } else if (category === 'authorized_persons_docs') {
        // Dokumenty pre oprávnené osoby - uložiť do internal_directives
        const result = await supabase
          .from('internal_directives')
          .insert({
            employee_document_id: selectedDocument.id,
            directive_type: selectedDocument.document_type_id,
            read: true,
            read_date: now,
            understood: true,
            ...(ipAddress && { ip_address: ipAddress }),
            user_agent: userAgent
          });
        error = result.error;
      } else if (category === 'revocation') {
        // Odobratie oprávnení - uložiť do revocation_records
        const result = await supabase
          .from('revocation_records')
          .insert({
            employee_document_id: selectedDocument.id,
            revocation_type: selectedDocument.document_type_id,
            revocation_date: now,
            revoked_by: null, // zamestnanec sám potvrdzuje
            effective_date: now
          });
        error = result.error;
      } else {
        // Ostatné dokumenty - uložiť do gdpr_acknowledgments
        const result = await supabase
          .from('gdpr_acknowledgments')
          .insert({
            employee_document_id: selectedDocument.id,
            acknowledgment_type: selectedDocument.document_type_id,
            acknowledged: true,
            acknowledgment_date: now,
            ...(ipAddress && { ip_address: ipAddress }),
            user_agent: userAgent
          });
        error = result.error;
      }
      
      if (error) throw error;

      // Aktualizovať status dokumentu
      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          status: 'acknowledged',
          acknowledged_at: now
        })
        .eq('id', selectedDocument.id);

      if (updateError) throw updateError;

      // Zatvoriť modal a obnoviť zoznam
      setSignModalOpen(false);
      setSelectedDocument(null);
      setConsentChecks({ data_processing: false, data_publication: false, general_ack: false });
      await loadAssignedDocuments();

    } catch (error) {
      console.error('Chyba pri podpisovaní dokumentu:', error);
    } finally {
      setSigning(false);
    }
  };

  // Otvoriť podpisový modál
  const openSignModal = (document: AssignedDocument) => {
    setSelectedDocument(document);
    setSignModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Načítavam dokumenty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Moje dokumenty</h1>
            <p className="text-sm text-gray-300">{employee.full_name}</p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                          {doc.status !== 'acknowledged' && (
                                            <button
                                              onClick={() => openSignModal(doc)}
                                              className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                                            >
                                              Podpísať
                                            </button>
                                          )}
                                          <button
                                            onClick={() => viewDocument(doc)}
                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Zobraziť dokument"
                                          >
                                            <Eye size={14} />
                                          </button>
                                          <button
                                            onClick={() => downloadDocument(doc)}
                                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                            title="Stiahnuť dokument"
                                          >
                                            <Download size={14} />
                                          </button>
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
          
          {assignedDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">Žiadne priradené dokumenty</p>
            </div>
          )}
        </div>
      </div>

      {/* Podpisový modál */}
      {signModalOpen && selectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <PenTool className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Podpísanie dokumentu
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <strong>{selectedDocument.document_name}</strong>
                    </p>
                    
                    {isConsentDocument(selectedDocument.document_type_id) ? (
                      <div className="mt-4 space-y-3">
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="consent1"
                              checked={consentChecks.data_processing}
                              onChange={(e) => setConsentChecks(prev => ({ ...prev, data_processing: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Súhlas so spracúvaním osobných údajov</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="consent2"
                              checked={consentChecks.data_publication}
                              onChange={(e) => setConsentChecks(prev => ({ ...prev, data_publication: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Súhlas so zverejnením osobných údajov</span>
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          Potvrdzujem, že som sa oboznámil/a s obsahom dokumentu. Kliknutím na [Podpísať] udeľujem dobrovoľný, slobodný a informovaný súhlas so spracúvaním mojich osobných údajov v rozsahu a na účely uvedené v dokumente.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="general_ack"
                              checked={consentChecks.general_ack}
                              onChange={(e) => setConsentChecks(prev => ({ ...prev, general_ack: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Potvrdzujem oboznámenie s obsahom dokumentu</span>
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          Potvrdzujem, že som sa v celom rozsahu oboznámil/a s obsahom tohto dokumentu, rozumiem jeho zneniu a svojím kliknutím na tlačidlo [Podpísať] prijímam a potvrdzujem všetky vyhlásenia, súhlasy a záväzky uvedené v jeho texte.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={signDocument}
                  disabled={signing || (isConsentDocument(selectedDocument.document_type_id) ? (!consentChecks.data_processing || !consentChecks.data_publication) : !consentChecks.general_ack)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signing ? 'Podpisujem...' : 'Podpísať'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignModalOpen(false);
                    setSelectedDocument(null);
                    setConsentChecks({ data_processing: false, data_publication: false, general_ack: false });
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocumentView;
