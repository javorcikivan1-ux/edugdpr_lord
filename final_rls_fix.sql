-- FINÁLNY RLS FIX BEZ WITH CHECK PROBLÉMU
-- Tvoj kamarát má pravdu - WITH CHECK spôsobuje 406 error

-- 1. Zmazať všetky staré policies
DROP POLICY IF EXISTS "Allow invitation acceptance during registration" ON invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON invitations;
DROP POLICY IF EXISTS "Company admins can update invitations" ON invitations;
DROP POLICY IF EXISTS "allow delete invitations" ON invitations;
DROP POLICY IF EXISTS "User can accept invitation" ON invitations;
DROP POLICY IF EXISTS "User can read own invitation" ON invitations;
DROP POLICY IF EXISTS "Company admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage all invitations" ON invitations;

-- 2. Vytvoriť bezpečné a správne policies
-- User môže čítať len svoje pozvánky
CREATE POLICY "Users can read own invitations" ON invitations
    FOR SELECT TO authenticated
    USING (lower(email) = lower(auth.email()));

-- User môže aktualizovať len svoje pozvánky (bez WITH CHECK)
CREATE POLICY "Users can update own invitations" ON invitations
    FOR UPDATE TO authenticated
    USING (lower(email) = lower(auth.email()));

-- Admini môžu spravovať všetky pozvánky
CREATE POLICY "Admins can manage all invitations" ON invitations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.id = auth.uid()
            AND employees.position IN ('ADMIN_ROOT', 'ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN')
        )
    );

-- 3. Overenie, že RLS je správne nastavený
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'invitations'
ORDER BY policyname;
