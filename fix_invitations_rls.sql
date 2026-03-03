-- Úplne vypnúť RLS pre pozvánky
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;

-- Vymazať všetky existujúce politiky
DROP POLICY IF EXISTS "Anyone can view company invitations" ON invitations;
DROP POLICY IF EXISTS "Anyone can create invitations" ON invitations;
DROP POLICY IF EXISTS "Anyone can update invitations" ON invitations;
DROP POLICY IF EXISTS "Allow insert for invitations" ON invitations;
