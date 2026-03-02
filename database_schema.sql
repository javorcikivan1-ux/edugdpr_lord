-- SQL Schema pre GDPR Training Platform
-- Spustiť v Supabase SQL Editor

-- 1. Rozšírenie existujúcej tabuľky trainings
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'gdpr',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[],
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_purchasable BOOLEAN DEFAULT true;

-- 2. Tabuľka pre moduly školení
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

-- 3. Tabuľka pre nákupy školení firmami
CREATE TABLE IF NOT EXISTS company_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1, -- počet licencií
    valid_until TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    payment_method TEXT DEFAULT 'invoice',
    invoice_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabuľka pre priradené školenia zamestnancom
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
    quiz_scores JSONB, -- uložené skóre z kvízov
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabuľka pre progress v moduloch
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

-- 6. Tabuľka pre certifikáty
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

-- 7. Indexy pre lepšiu výkonnosť
CREATE INDEX IF NOT EXISTS idx_training_modules_training_id ON training_modules(training_id);
CREATE INDEX IF NOT EXISTS idx_company_purchases_company_id ON company_purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_company_purchases_training_id ON company_purchases(training_id);
CREATE INDEX IF NOT EXISTS idx_employee_trainings_employee_id ON employee_trainings(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_trainings_training_id ON employee_trainings(training_id);
CREATE INDEX IF NOT EXISTS idx_employee_trainings_status ON employee_trainings(status);
CREATE INDEX IF NOT EXISTS idx_employee_module_progress_employee_training_id ON employee_module_progress(employee_training_id);
CREATE INDEX IF NOT EXISTS idx_certificates_employee_id ON certificates(employee_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

-- 8. Triggery pre automatické aktualizácie
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

-- 9. RLS (Row Level Security) politiky
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

-- 10. Vzorové dáta (môžeš vymazať po testovaní)
INSERT INTO trainings (title, description, price, duration_hours, difficulty_level, category, status, created_by) VALUES
('Základy GDPR pre zamestnancov', 'Komplexné školenie o základných princípoch GDPR a ich aplikácii v pracovnom prostredí.', 49.99, 2, 'beginner', 'gdpr', 'published', '00000000-0000-0000-0000-000000000000'),
('Pokročilé GDPR pre manažérov', 'Pokročilé témy GDPR vrátane spracovania údajov, DPO rolí a incidentov.', 89.99, 4, 'advanced', 'gdpr', 'published', '00000000-0000-0000-0000-000000000000'),
('Bezpečnosť údajov v IT', 'Ochrana údajov v IT systémoch, šifrovanie a bezpečnostné postupy.', 69.99, 3, 'intermediate', 'security', 'published', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Vzorové moduly pre prvé školenie
INSERT INTO training_modules (training_id, title, content, order_index, module_type, duration_minutes) VALUES
((SELECT id FROM trainings WHERE title = 'Základy GDPR pre zamestnancov' LIMIT 1), 
 'Úvod do GDPR', 'Čo je GDPR, jeho história a základné princípy.', 1, 'text', 20),
((SELECT id FROM trainings WHERE title = 'Základy GDPR pre zamestnancov' LIMIT 1), 
 'Práva a povinnosti', 'Práva subjektov údajov a povinnosti správcov údajov.', 2, 'text', 25),
((SELECT id FROM trainings WHERE title = 'Základy GDPR pre zamestnancov' LIMIT 1), 
 'Test - Základy GDPR', 'Kvíz na overenie znalostí z modulov 1-2.', 3, 'quiz', 15)
ON CONFLICT DO NOTHING;
