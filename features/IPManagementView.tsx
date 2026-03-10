
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Employee } from '../types';
import { supabase, getEmployees, uploadAndAssignIP, getAllAssignments, getAssignmentsCount } from '../lib/supabase';
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
  Eye,
  Download,
  Loader2
} from 'lucide-react';

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
      
      const { data: assignData } = await getAllAssignments(assignmentLimit, 0, finalSearchQuery);
      if (assignData) {
        // Resetujeme len keď máme nové dáta
        setAssignmentsSummary(assignData);
      }
      
      // Skontrolujeme, či je viac priradení
      const { count } = await getAssignmentsCount(finalSearchQuery);
      setHasMoreAssignments(count ? count > assignmentLimit : false);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const loadMoreAssignments = async () => {
    try {
      const { data: assignData } = await getAllAssignments(50, assignmentsSummary.length, monitorSearch);
      if (assignData) {
        setAssignmentsSummary([...assignmentsSummary, ...assignData]);
      }
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
      if (a.status === 'SIGNED') entry.signedCount++;
    });

    return Array.from(map.values());
  }, [assignmentsSummary]);

  const handleOpenDetail = async (empSummary: any) => {
    setSelectedEmployeeDetail(empSummary);
    setDetailLoading(true);
    try {
      const { data, error } = await supabase
        .from('assigned_documents')
        .select('*, document:document_id(*)')
        .eq('employee_id', empSummary.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSelectedEmployeeDetail({
        ...empSummary,
        docs: data || []
      });
    } catch (err: any) {
      showToast('Chyba pri načítaní: ' + err.message, 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async (id: string, url: string, title: string) => {
    if (!url) return;
    setDownloadingIds(prev => new Set(prev).add(id));
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
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from('assigned_documents').delete().eq('id', assignmentId);
      if (error) throw error;
      showToast('Priradenie bolo zrušené', 'success');
      if (selectedEmployeeDetail && selectedEmployeeDetail.docs) {
        const updatedDocs = selectedEmployeeDetail.docs.filter((d: any) => d.id !== assignmentId);
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

  const handleUpload = async () => {
    if (!selectedFile || !fileTitle || selectedEmps.length === 0) {
      showToast('Vyberte súbor, názov a adresátov', 'error');
      return;
    }
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
    }
  };

  const exportToPDF = async () => {
    setIsExportingPDF(true);
    try {
      console.log('Exporting PDF, employees count:', groupedMonitor.length);

      // Načítame detaily pre všetkých zamestnancov
      const allDocs = await Promise.all(
        groupedMonitor.map(async (emp) => {
          const { data: docs } = await supabase
            .from('assigned_documents')
            .select('*, document:document_id(*)')
            .eq('employee_id', emp.id)
            .order('created_at', { ascending: false });
          return { ...emp, docs: docs || [] };
        })
      );

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
            <p>Dátum: ${currentDate} | Zamestnanci: ${groupedMonitor.length}</p>
          </div>
          ${allDocs.map((emp) => {
            const docsHtml = emp.docs.map((doc: any) => `
              <div class="document">
                <div class="document-title">${(doc.document?.title || 'Dokument').substring(0, 80)}${doc.document?.title && doc.document.title.length > 80 ? '...' : ''}</div>
                <div style="font-size: 11pt; color: #666; margin-bottom: 1px;">
                  Stav: ${doc.status === 'SIGNED' ? '<span style="color: #16a34a; font-weight: 600;">✓ Podpísané</span>' : '⏰ Čaká na podpis'}
                </div>
                <div style="font-size: 11pt; color: #666;">
                  Priradené: ${new Date(doc.created_at).toLocaleDateString('sk-SK')}${doc.signed_at ? ' | Podpísané: ' + new Date(doc.signed_at).toLocaleDateString('sk-SK') : ''}
                </div>
              </div>
            `).join('');
            
            return `
              <div class="employee">
                <h2>${emp.name}</h2>
                <p>${emp.email}</p>
                <p class="stats">${emp.signedCount}/${emp.assignedCount} podpísané</p>
                <h3>Dokumenty (${emp.docs.length}):</h3>
                ${docsHtml || '<p style="color: #666; font-style: italic;">Žiadne dokumenty</p>'}
              </div>
            `;
          }).join('')}
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
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Informačné povinnosti</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Monitoring digitálnych podpisov a audit súladu v reálnom čase.</p>
        </div>

        {/* INFORMAČNÝ BOX - KOMPAKTNÝ PY-7 PX-8 */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-y-3">
              {[
                { t: "Priraďte dokument na podpis vybraným zamestnancom", i: <Users size={16}/> },
                { t: "Sledujte prehľad o stave oboznámenia", i: <Eye size={16}/> },
                { t: "Systém eviduje, kedy bola informačná povinnosť podpísaná", i: <CheckCircle2 size={16}/> },
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
                 Export všetko PDF
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
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          exportEmployeeToPDF(emp);
                        }}
                        disabled={isExportingPDF}
                        className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Exportovať PDF"
                      >
                        {isExportingPDF ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>}
                      </button>
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
                   <div className="w-14 h-14 bg-brand-orange/10 rounded-xl flex items-center justify-center text-2xl font-semibold text-brand-orange">
                     {selectedEmployeeDetail.name[0]}
                   </div>
                   <div>
                      <h2 className="text-2xl font-semibold text-white">{selectedEmployeeDetail.name}</h2>
                      <p className="text-sm text-white/80">{selectedEmployeeDetail.email}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedEmployeeDetail(null)} className="w-10 h-10 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all flex items-center justify-center"><X size={20}/></button>
             </div>

             <div className="p-8 overflow-y-auto no-scrollbar space-y-8 flex-1 bg-slate-50/30">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3"><History size={20} className="text-brand-orange"/> Súpis priradených dokumentov</h3>
                     <div className="flex gap-6">
                        <div className="text-center">
                           <p className="text-xs text-slate-500 uppercase tracking-wider">Priradené</p>
                           <p className="text-2xl font-bold text-slate-900">{selectedEmployeeDetail.assignedCount}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-xs text-slate-500 uppercase tracking-wider">Podpísané</p>
                           <p className="text-2xl font-bold text-emerald-600">{selectedEmployeeDetail.signedCount}</p>
                        </div>
                     </div>
                   </div>
                </div>

                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-brand-orange" size={40} />
                    <p className="text-sm font-medium text-slate-500">Načítavam dokumenty...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {selectedEmployeeDetail.docs?.map((a: any) => (
                      <div key={a.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-6 mb-4">
                            <div className="space-y-2 flex-1">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${
                                  a.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {a.status === 'SIGNED' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                                  {a.status === 'SIGNED' ? 'Podpísané' : 'Čaká na podpis'}
                                </span>
                                <h4 className="text-lg font-semibold text-slate-900">{a.document?.title}</h4>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button 
                                  onClick={() => handleDownload(a.id, a.document?.file_url, a.document?.title)} 
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
                                <button onClick={() => setDeleteConfirmId(a.id)} className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm" title="Zrušiť priradenie">
                                  <Trash2 size={16}/>
                                </button>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  a.status === 'SIGNED' 
                                    ? 'bg-emerald-100 text-emerald-600 border border-emerald-100' 
                                    : 'bg-amber-100 text-amber-700 border border-amber-100'
                                }`}>
                                  {a.status === 'SIGNED' ? <Check size={20} strokeWidth={3}/> : <PenTool size={20}/>}
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
                    ))}
                  </div>
                )}
             </div>

             <div className="p-6 bg-white border-t border-slate-200 flex justify-center shrink-0">
                <button onClick={() => setSelectedEmployeeDetail(null)} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all">Zavrieť detail</button>
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
    </div>
  );
};

export default IPManagementView;
