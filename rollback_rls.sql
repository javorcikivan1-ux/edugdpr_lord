-- OKAMŽITÝ NÁVRAT DO PÔVODNÉHO STAVU
-- VYPNÚŤ RLS ÚPNE - VŠETKO BUDE FUNGOVAŤ AKO PREDTÝM

-- 1. Vypnúť RLS pre employee_documents
ALTER TABLE employee_documents DISABLE ROW LEVEL SECURITY;

-- 2. Vypnúť RLS pre všetky ostatné tabuľky
ALTER TABLE gdpr_consents DISABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_acknowledgments DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE handover_protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal_directives DISABLE ROW LEVEL SECURITY;
ALTER TABLE revocation_records DISABLE ROW LEVEL SECURITY;

-- 3. Zmazať všetky RLS politiky
DROP POLICY IF EXISTS "Enable all operations for all users" ON employee_documents;
DROP POLICY IF EXISTS "Employees can view own documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins and employees can update documents" ON employee_documents;

-- 4. Test - zobraziť všetky dokumenty (malo by fungovať)
SELECT COUNT(*) as total_documents FROM employee_documents;

-- VŠETKO JE TERAZ BEZ RLS - FUNGOVAŤ TO AKO PREDTÝM
