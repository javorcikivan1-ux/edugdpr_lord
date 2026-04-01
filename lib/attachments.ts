import { supabase } from './supabase';

export interface TrainingAttachment {
  id: string;
  training_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  is_required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Získanie príloh pre školenie (pre všetkých - len info)
export const getTrainingAttachments = async (trainingId: string): Promise<{ data: TrainingAttachment[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('training_attachments')
      .select('*')
      .eq('training_id', trainingId)
      .order('order_index', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Získanie príloh pre zamestnanca (s možnosťou stiahnutia)
export const getAttachmentsForEmployee = async (trainingId: string, employeeId: string): Promise<{ data: TrainingAttachment[] | null, error: any }> => {
  try {
    // Najprv skontrolujeme, či má zamestnanec priradené školenie
    const { data: assignment, error: assignmentError } = await supabase
      .from('employee_trainings')
      .select('id')
      .eq('training_id', trainingId)
      .eq('employee_id', employeeId)
      .single();

    if (assignmentError || !assignment) {
      return { data: null, error: 'Zamestnanec nemá priradené toto školenie' };
    }

    // Ak má, vrátime prílohy
    const { data, error } = await supabase
      .from('training_attachments')
      .select('*')
      .eq('training_id', trainingId)
      .order('order_index', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Generovanie podpísanej URL pre stiahnutie súboru
export const getAttachmentDownloadUrl = async (filePath: string): Promise<{ data: string | null, error: any }> => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60); // 60 sekundová platnosť URL

    return { data: data?.signedUrl || null, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Nahrávanie prílohy (pre admina)
export const uploadAttachment = async (
  trainingId: string,
  file: File,
  title: string,
  description?: string,
  isRequired: boolean = false
): Promise<{ data: TrainingAttachment | null, error: any }> => {
  try {
    // Generovanie unikátneho názvu súboru
    const fileExt = file.name.split('.').pop();
    // Sanitizácia názvu súboru - odstránenie špeciálnych znakov a medzier
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Nahradenie špeciálnych znakov podčiarkovníkom
      .replace(/\s+/g, '_') // Nahradenie medzier podčiarkovníkom
      .substring(0, 50); // Obmedzenie dĺžky
    const fileName = `${trainingId}-${Date.now()}-${sanitizedName}`;
    
    // Nahranie súboru do existujúceho 'documents' bucketu
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Vytvorenie záznamu v databáze
    const { data, error } = await supabase
      .from('training_attachments')
      .insert({
        training_id: trainingId,
        title,
        description,
        file_name: file.name, // Pôvodný názov pre zobrazenie
        file_path: fileName, // Sanitizovaný názov pre storage
        file_size: file.size,
        file_type: fileExt || 'unknown',
        is_required: isRequired
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Formátovanie veľkosti súboru
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Získanie ikony podľa typu súboru
export const getFileIcon = (fileType: string): string => {
  const type = fileType.toLowerCase();
  if (['pdf'].includes(type)) return '📄';
  if (['ppt', 'pptx'].includes(type)) return '📊';
  if (['doc', 'docx'].includes(type)) return '📝';
  if (['xls', 'xlsx'].includes(type)) return '📈';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) return '🖼️';
  if (['mp4', 'avi', 'mov'].includes(type)) return '🎥';
  if (['mp3', 'wav', 'ogg'].includes(type)) return '🎵';
  return '📎';
};
