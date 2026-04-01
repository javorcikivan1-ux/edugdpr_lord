-- Základné tabuľky (spustiť PRVÉ)
-- Vytvorí existujúce tabuľky, na ktoré sa odkazuje rozšírená schema

-- 1. Tabuľka používateľov (ak neexistuje)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabuľka firiem
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    company_token TEXT UNIQUE, -- Pridané pre unikátny token firmy
    user_id UUID REFERENCES auth.users(id), -- Pridané pre RLS politiky
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabuľka zamestnancov
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_token TEXT,
    user_id UUID REFERENCES auth.users(id), -- Pridané pre RLS politiky
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Základná tabuľka školení
CREATE TABLE IF NOT EXISTS trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Pridanie stĺpcov do trainings (ak ešte neexistujú)
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

-- 5.1 Pridanie user_id stĺpcov do tabuliek (ak neexistujú)
DO $$
BEGIN
    -- Pridanie user_id do companies, ak neexistuje
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_id') THEN
        ALTER TABLE companies ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    -- Pridanie user_id do employees, ak neexistuje
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'user_id') THEN
        ALTER TABLE employees ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 6. Vytvorenie tabuľky pre moduly školení
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

-- 7. Vytvorenie tabuľky pre nákupy školení firmami
CREATE TABLE IF NOT EXISTS company_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    valid_until TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    payment_method TEXT DEFAULT 'invoice',
    invoice_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Vytvorenie tabuľky pre priradené školenia zamestnancom
CREATE TABLE IF NOT EXISTS employee_trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    company_purchase_id UUID REFERENCES company_purchases(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed', 'expired')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_module_index INTEGER DEFAULT 0,
    quiz_scores JSONB,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Vytvorenie tabuľky pre progress v moduloch
CREATE TABLE IF NOT EXISTS employee_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_training_id UUID REFERENCES employee_trainings(id) ON DELETE CASCADE,
    module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    quiz_score INTEGER,
    quiz_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Vytvorenie tabuľky pre certifikáty
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    employee_training_id UUID REFERENCES employee_trainings(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    pdf_url TEXT,
    verification_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Indexy pre lepšiu výkonnosť
CREATE INDEX IF NOT EXISTS idx_training_modules_training_id ON training_modules(training_id);
CREATE INDEX IF NOT EXISTS idx_company_purchases_company_id ON company_purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_company_purchases_training_id ON company_purchases(training_id);
CREATE INDEX IF NOT EXISTS idx_employee_trainings_employee_id ON employee_trainings(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_trainings_training_id ON employee_trainings(training_id);
CREATE INDEX IF NOT EXISTS idx_employee_trainings_status ON employee_trainings(status);
CREATE INDEX IF NOT EXISTS idx_employee_module_progress_employee_training_id ON employee_module_progress(employee_training_id);
CREATE INDEX IF NOT EXISTS idx_certificates_employee_id ON certificates(employee_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

-- 12. Triggery pre automatické aktualizácie
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON training_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_trainings_updated_at BEFORE UPDATE ON employee_trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_module_progress_updated_at BEFORE UPDATE ON employee_module_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. RLS (Row Level Security) politiky
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Politiky pre training_modules
CREATE POLICY "Admins can manage all modules" ON training_modules
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'super_admin' OR
        (SELECT created_by FROM trainings WHERE id = training_modules.training_id) = auth.uid()
    );

-- Politiky pre company_purchases
CREATE POLICY "Companies can view their purchases" ON company_purchases
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'super_admin' OR
        company_id = (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- Politiky pre employee_trainings
CREATE POLICY "Companies can manage employee trainings" ON employee_trainings
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'super_admin' OR
        employee_id IN (
            SELECT id FROM employees 
            WHERE company_token = (SELECT company_token FROM employees WHERE user_id = auth.uid() LIMIT 1)
        )
    );
