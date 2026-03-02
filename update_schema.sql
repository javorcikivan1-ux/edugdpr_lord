-- DOPĽŇUJÚCE STĹPCE PRE TRAININGS TABUĽKU
DO $$
BEGIN
    -- Check if columns exist before adding them
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'status') THEN
        ALTER TABLE trainings ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'price') THEN
        ALTER TABLE trainings ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'duration_hours') THEN
        ALTER TABLE trainings ADD COLUMN duration_hours INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'difficulty_level') THEN
        ALTER TABLE trainings ADD COLUMN difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'category') THEN
        ALTER TABLE trainings ADD COLUMN category TEXT DEFAULT 'gdpr';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'learning_objectives') THEN
        ALTER TABLE trainings ADD COLUMN learning_objectives TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'created_by') THEN
        ALTER TABLE trainings ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'updated_at') THEN
        ALTER TABLE trainings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'is_purchasable') THEN
        ALTER TABLE trainings ADD COLUMN is_purchasable BOOLEAN DEFAULT true;
    END IF;
END $$;

-- VYTVORENIE TRAINING_MODULES TABUĽKY (ak neexistuje)
CREATE TABLE IF NOT EXISTS training_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    module_type TEXT DEFAULT 'text' CHECK (module_type IN ('text', 'video', 'quiz', 'interactive')),
    video_url TEXT,
    quiz_questions JSONB,
    duration_minutes INTEGER DEFAULT 15,
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pridanie user_id stĺpcov (ak neexistujú)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_id') THEN
        ALTER TABLE companies ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'user_id') THEN
        ALTER TABLE employees ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;
