-- Vypnúť RLS pre gdpr_acknowledgments (pre vývoj)
ALTER TABLE gdpr_acknowledgments DISABLE ROW LEVEL SECURITY;

-- Vypnúť RLS pre gdpr_consents (pre vývoj)  
ALTER TABLE gdpr_consents DISABLE ROW LEVEL SECURITY;
