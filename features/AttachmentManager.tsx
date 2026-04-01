import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';
import { uploadAttachment, getTrainingAttachments, TrainingAttachment } from '../lib/attachments';
import { 
  Upload, 
  X, 
  FileText, 
  Download, 
  Trash2, 
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileIcon
} from 'lucide-react';

interface AttachmentManagerProps {
  trainingId: string;
  trainingTitle: string;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({ trainingId, trainingTitle }) => {
  const { showToast } = useToast();
  const [attachments, setAttachments] = useState<TrainingAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Form data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [trainingId]);

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const { data, error } = await getTrainingAttachments(trainingId);
      if (error) {
        console.error('Chyba pri načítaní príloh:', error);
        showToast('Chyba pri načítaní príloh', 'error');
      } else {
        setAttachments(data || []);
      }
    } catch (error) {
      console.error('Chyba:', error);
      showToast('Chyba pri načítaní príloh', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      showToast('Vyberte súbor a vyplňte názov', 'error');
      return;
    }

    setUploading(true);
    try {
      const { data, error } = await uploadAttachment(
        trainingId,
        selectedFile,
        title.trim(),
        description.trim() || undefined,
        isRequired
      );

      if (error) {
        console.error('Chyba pri nahrávaní:', error);
        showToast('Chyba pri nahrávaní súboru', 'error');
      } else {
        showToast('Príloha bola úspešne nahraná', 'success');
        // Reset form
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        setIsRequired(false);
        setShowUploadForm(false);
        // Refresh list
        fetchAttachments();
      }
    } catch (error) {
      console.error('Chyba:', error);
      showToast('Chyba pri nahrávaní súboru', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Naozaj chcete vymazať túto prílohu?')) return;

    try {
      // Najprv zistíme cestu k súboru
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      // Vymažeme záznam z databázy
      const { error } = await supabase
        .from('training_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) {
        console.error('Chyba pri mazaní:', error);
        showToast('Chyba pri mazaní prílohy', 'error');
      } else {
        // Vymažeme súbor z 'documents' bucketu
        await supabase.storage
          .from('documents')
          .remove([attachment.file_path]);

        showToast('Príloha bola vymazaná', 'success');
        fetchAttachments();
      }
    } catch (error) {
      console.error('Chyba:', error);
      showToast('Chyba pri mazaní prílohy', 'error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    const type = fileType.toLowerCase();
    if (['pdf'].includes(type)) return '📄';
    if (['ppt', 'pptx'].includes(type)) return '📊';
    if (['doc', 'docx'].includes(type)) return '📝';
    if (['xls', 'xlsx'].includes(type)) return '📈';
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Prílohy školenia</h3>
          <p className="text-sm text-slate-500 mt-1">
            Správa príloh pre školenie: {trainingTitle}
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          Pridať prílohu
        </button>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">Nahrať novú prílohu</h4>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Súbor
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-orange transition-colors">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload size={32} className="text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {selectedFile ? selectedFile.name : 'Kliknite pre výber súboru'}
                    </span>
                    <span className="text-xs text-slate-400">
                      PDF, PPT, DOC, XLS (max 50MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Názov prílohy *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Napr. Študijný materiál - Ochrana osobných údajov"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Popis (voliteľné)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  rows={3}
                  placeholder="Krátky popis obsahu prílohy..."
                />
              </div>

              {/* Is Required */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is-required"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4 text-brand-orange border-slate-300 rounded focus:ring-brand-orange"
                />
                <label htmlFor="is-required" className="text-sm font-medium text-slate-700">
                  Povinná príloha (zamestnanec musí stiahnuť)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !title.trim()}
                className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Nahrávam...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Nahrať
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <FileText size={32} className="text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Žiadne prílohy</p>
            <p className="text-sm text-slate-400 mt-2">
              Toto školenie zatiaľ nemá žiadne prílohy
            </p>
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                    {getFileIcon(attachment.file_type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{attachment.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-slate-500 capitalize">
                        {attachment.file_type}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-500">
                        {formatFileSize(attachment.file_size)}
                      </span>
                      {attachment.is_required && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Povinné
                          </span>
                        </>
                      )}
                    </div>
                    {attachment.description && (
                      <p className="text-sm text-slate-600 mt-2">{attachment.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Vymazať prílohu"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
