
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// --- ROZHRANIA (INTERFACES) ---
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration_minutes: number;
  order: number;
  type: 'text' | 'video' | 'quiz';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  full_description?: string;
  duration: number; 
  price: number;
  category: string;
  instructor: string;
  instructor_title?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  faq?: FAQItem[];
  note?: string;
  isActive: boolean;
  is_premium: boolean;
  status: string; 
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  tags: string[];
  requirements: string[];
  objectives: string[];
}

interface TrainingState {
  trainings: Training[];
  loading: boolean;
  error: string | null;
}

type TrainingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRAININGS'; payload: Training[] };

const initialState: TrainingState = {
  trainings: [],
  loading: false,
  error: null
};

const trainingReducer = (state: TrainingState, action: TrainingAction): TrainingState => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'SET_TRAININGS': return { ...state, trainings: action.payload, loading: false, error: null };
    default: return state;
  }
};

const TrainingContext = createContext<{
  state: TrainingState;
  dispatch: React.Dispatch<TrainingAction>;
} | null>(null);

export const TrainingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trainingReducer, initialState);

  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase
          .from('trainings')
          .select('*, lessons:training_modules(*)')
          .neq('status', 'archived')
          .order('title', { ascending: true });

        if (error) throw error;

        const mappedData: Training[] = (data || []).map(t => {
          // Fix: Robustné zlúčenie objectives a learning_objectives
          let combinedObjectives: string[] = [];
          if (Array.isArray(t.objectives)) combinedObjectives = [...combinedObjectives, ...t.objectives];
          if (Array.isArray(t.learning_objectives)) combinedObjectives = [...combinedObjectives, ...t.learning_objectives];
          
          // Unikátne a neprázdne hodnoty
          const uniqueObjectives = Array.from(new Set(combinedObjectives))
            .filter(o => typeof o === 'string' && o.trim() !== '');

          return {
            ...t,
            duration: t.duration || (t.duration_hours ? t.duration_hours * 60 : 0),
            instructor: t.instructor || 'Mgr. Ivan Javorčík',
            difficulty: t.difficulty || 'beginner',
            isActive: t.isActive !== undefined ? t.isActive : (t.status === 'published'),
            is_premium: t.is_premium || false,
            lessons: (t.lessons || []).map((l: any) => ({
              id: l.id,
              title: l.title,
              description: l.description || '',
              content: l.content || '',
              duration_minutes: l.duration_minutes || 10,
              order: l.order_index,
              type: l.module_type
            })).sort((a: any, b: any) => a.order - b.order),
            createdAt: t.created_at,
            updatedAt: t.updated_at || t.created_at,
            tags: t.tags || [],
            requirements: t.requirements || [],
            objectives: uniqueObjectives,
            note: t.note || ''
          };
        });

        dispatch({ type: 'SET_TRAININGS', payload: mappedData });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', payload: e.message });
      }
    };

    fetchInitialData();
  }, []);

  return (
    <div className="text-left">
      <TrainingContext.Provider value={{ state, dispatch }}>
        {children}
      </TrainingContext.Provider>
    </div>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) throw new Error('useTraining musí byť použitý v rámci TrainingProvider');
  return context;
};
