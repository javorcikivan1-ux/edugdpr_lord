-- Tabuľka pre prílohy ku školeniam
CREATE TABLE IF NOT EXISTS training_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL, -- v bajtoch
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'ppt', 'doc', atď.
    is_required BOOLEAN DEFAULT false, -- či je povinná časť školenia
    order_index INTEGER DEFAULT 0, -- poradie zobrazenia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_training_attachments_training_id ON training_attachments(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attachments_order ON training_attachments(training_id, order_index);

-- RLS (Row Level Security) policy
ALTER TABLE training_attachments ENABLE ROW LEVEL SECURITY;

-- Zrušenie existujúcich policies (pre Supabase)
DROP POLICY IF EXISTS "Anyone can view attachments" ON training_attachments;
DROP POLICY IF EXISTS "Only assigned employees can download" ON training_attachments;
DROP POLICY IF EXISTS "Admins can manage attachments" ON training_attachments;

-- Vytvorenie nových RLS policies
CREATE POLICY "Anyone can view attachments" ON training_attachments
    FOR SELECT USING (true);

-- Policy: len zamestnanci s priradeným školením môžu stiahnuť
CREATE POLICY "Only assigned employees can download" ON training_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employee_trainings et
            WHERE et.training_id = training_attachments.training_id
            AND et.employee_id = auth.uid()
        )
    );

-- Policy: len super admini môžu vkladať prílohy
CREATE POLICY "Admins can insert attachments" ON training_attachments
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'super_admin')
    );

-- Policy: len super admini môžu aktualizovať prílohy
CREATE POLICY "Admins can update attachments" ON training_attachments
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'super_admin')
    );

-- Policy: len super admini môžu mazať prílohy
CREATE POLICY "Admins can delete attachments" ON training_attachments
    FOR DELETE USING (
        auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'super_admin')
    );
