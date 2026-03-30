-- OKAMŽITÁ OPRAVA - OBNOVENIE FUNGOVANÍ
-- Spustiť v Supabase SQL Editor OKAMŽITE!

-- 1. Zmazať nebezpečnú politiku
DROP POLICY IF EXISTS "Enable all operations for all users" ON employee_documents;

-- 2. Vytvoriť bezpečné a funkčné RLS politiky
-- Politika pre čítanie - zamestnanci vidia svoje dokumenty, admini všetky
CREATE POLICY "Employees can view own documents" ON employee_documents
    FOR SELECT USING (
        auth.uid()::text = (SELECT user_id::text FROM employees WHERE id = employee_id)
        OR 
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

-- Politika pre vkladanie - admini môžu priraďovať dokumenty
CREATE POLICY "Admins can insert documents" ON employee_documents
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

-- Politika pre aktualizáciu - admini a vlastníci môžu aktualizovať
CREATE POLICY "Admins and employees can update documents" ON employee_documents
    FOR UPDATE USING (
        auth.uid()::text = (SELECT user_id::text FROM employees WHERE id = employee_id)
        OR 
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

-- 3. Zabezpečiť, že RLS je zapnutý
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;

-- 4. Rýchly test - zobraziť počet dokumentov
SELECT COUNT(*) as total_documents FROM employee_documents;
