-- RIEŠENIE PROBLÉMOV S EMPLOYEE DOCUMENTS
-- Spustiť v Supabase SQL Editor

-- 1. Dočasné vypnutie RLS (pre testovanie)
ALTER TABLE employee_documents DISABLE ROW LEVEL SECURITY;

-- 2. Alebo lepšie - upraviť RLS policies tak, aby fungovali
-- Najprv zmazať existujúce policies
DROP POLICY IF EXISTS "Employees can view own documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON employee_documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON employee_documents;

-- Vytvoriť jednoduchšie policies (povoliť všetko pre všetkých počas vývoja)
CREATE POLICY "Enable all operations for all users" ON employee_documents
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Znovu povoliť RLS
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;

-- 4. Alternatíva - úplne vypnúť RLS pre employee_documents (len pre vývoj)
-- ALTER TABLE employee_documents DISABLE ROW LEVEL SECURITY;
