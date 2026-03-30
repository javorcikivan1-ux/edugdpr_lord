-- RIEŠENIE RLS PROBLÉMOV PRE VŠETKY TABUĽKY
-- Spustiť v Supabase SQL Editor

-- 1. Najprv zmazať existujúce policies pre všetky tabuľky
DROP POLICY IF EXISTS "Enable all operations for all users" ON employee_documents;
DROP POLICY IF EXISTS "Employees can view own documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON employee_documents;

-- RLS policies pre gdpr_consents
DROP POLICY IF EXISTS "Enable all operations for all users" ON gdpr_consents;
CREATE POLICY "Enable all operations for all users" ON gdpr_consents
    FOR ALL USING (true) WITH CHECK (true);

-- RLS policies pre gdpr_acknowledgments  
DROP POLICY IF EXISTS "Enable all operations for all users" ON gdpr_acknowledgments;
CREATE POLICY "Enable all operations for all users" ON gdpr_acknowledgments
    FOR ALL USING (true) WITH CHECK (true);

-- RLS policies pre access_permissions
DROP POLICY IF EXISTS "Enable all operations for all users" ON access_permissions;
CREATE POLICY "Enable all operations for all users" ON access_permissions
    FOR ALL USING (true) WITH CHECK (true);

-- RLS policies pre handover_protocols
DROP POLICY IF EXISTS "Enable all operations for all users" ON handover_protocols;
CREATE POLICY "Enable all operations for all users" ON handover_protocols
    FOR ALL USING (true) WITH CHECK (true);

-- RLS policies pre internal_directives
DROP POLICY IF EXISTS "Enable all operations for all users" ON internal_directives;
CREATE POLICY "Enable all operations for all users" ON internal_directives
    FOR ALL USING (true) WITH CHECK (true);

-- RLS policies pre revocation_records
DROP POLICY IF EXISTS "Enable all operations for all users" ON revocation_records;
CREATE POLICY "Enable all operations for all users" ON revocation_records
    FOR ALL USING (true) WITH CHECK (true);

-- Znovu povoliť RLS pre všetky tabuľky (ak boli vypnuté)
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE revocation_records ENABLE ROW LEVEL SECURITY;

-- Pre istotu skontrolovať, či RLS je povolené
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename IN (
    'employee_documents', 
    'gdpr_consents', 
    'gdpr_acknowledgments',
    'access_permissions',
    'handover_protocols', 
    'internal_directives',
    'revocation_records'
)
ORDER BY tablename;
