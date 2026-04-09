-- Oprava RLS politiky pre invitations tabuÄ¾ku s email normalizáciou
-- Problém: email mismatch medzi auth.users.email a invitations.email

-- Najprv odstrÃ¡nieme starÃº politiku
DROP POLICY IF EXISTS "Anyone can update invitations" ON invitations;

-- VytvorÃme novÃº, opravenÃº politiku s email normalizáciou
CREATE POLICY "Anyone can update invitations" ON invitations
    FOR UPDATE USING (
        -- PovoliÅ¥ aktualizÃciu pre zamestnancov firmy
        company_token IN (
            SELECT company_token FROM employees 
            WHERE user_id = auth.uid()
        )
        -- PovoliÅ¥ aktualizÃciu aj pre email verification s normalizovaným emailom
        OR (LOWER(TRIM(auth.jwt() ->> 'email')) = LOWER(TRIM(email))
    );
