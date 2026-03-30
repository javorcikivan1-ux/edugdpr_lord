-- SQL Schema pre Employee Documents
-- Spustiť v Supabase SQL Editor

-- 1. Hlavná tabuľka pre všetky dokumenty zamestnancov
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    document_type_id TEXT NOT NULL, -- napr. 'gdpr_employee_info', 'consent_data_processing', atď.
    document_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- cesta v Supabase Storage
    file_size BIGINT,
    mime_type TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'rejected', 'expired')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    assigned_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabuľka pre GDPR súhlasy (podpisy, IP adresa atď.)
CREATE TABLE IF NOT EXISTS gdpr_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_document_id UUID REFERENCES employee_documents(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- 'data_processing', 'data_publication', atď.
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    signature_data TEXT, -- elektronický podpis (base64)
    withdrawal_date TIMESTAMP WITH TIME ZONE, -- odvolanie súhlasu
    withdrawal_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabuľka pre GDPR oboznámenia (potvrdenia prečítania)
CREATE TABLE IF NOT EXISTS gdpr_acknowledgments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_document_id UUID REFERENCES employee_documents(id) ON DELETE CASCADE,
    acknowledgment_type TEXT NOT NULL, -- 'employee_info', 'processor_info', 'camera_info'
    acknowledged BOOLEAN DEFAULT false,
    acknowledgment_date TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabuľka pre prístupy a poverenia
CREATE TABLE IF NOT EXISTS access_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_document_id UUID REFERENCES employee_documents(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL, -- 'user_system', 'secure_area', atď.
    access_level TEXT, -- 'read', 'write', 'admin'
    granted_at TIMESTAMP WITH TIME ZONE,
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    access_details JSONB, -- detaily o prístupe (napr. ktoré systémy, priestory)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabuľka pre preberacie protokoly
CREATE TABLE IF NOT EXISTS handover_protocols (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_document_id UUID REFERENCES employee_documents(id) ON DELETE CASCADE,
    protocol_type TEXT NOT NULL, -- 'activities', 'access_resources'
    items_handed_over JSONB, -- zoznam predaných položiek
    handover_date TIMESTAMP WITH TIME ZONE,
    handed_over_by UUID REFERENCES auth.users(id),
    received_by UUID REFERENCES employees(id),
    condition_notes TEXT, -- poznámky o stave aktív
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabuľka pre interné smernice
CREATE TABLE IF NOT EXISTS internal_directives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_document_id UUID REFERENCES employee_documents(id) ON DELETE CASCADE,
    directive_type TEXT NOT NULL, -- 'personnel_security', 'security_incidents', atď.
    read BOOLEAN DEFAULT false,
    read_date TIMESTAMP WITH TIME ZONE,
    understood BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabuľka pre odobratie oprávnení a odovzdanie aktív
CREATE TABLE IF NOT EXISTS revocation_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_document_id UUID REFERENCES employee_documents(id) ON DELETE CASCADE,
    revocation_type TEXT NOT NULL, -- 'authorized_person', 'user_access', 'system_access', atď.
    revocation_date TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id),
    reason TEXT,
    effective_date TIMESTAMP WITH TIME ZONE,
    items_returned JSONB, -- zoznam vrátených položiek
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Indexy pre lepší výkon
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON employee_documents(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_consents_employee_doc ON gdpr_consents(employee_document_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_acknowledgments_employee_doc ON gdpr_acknowledgments(employee_document_id);
CREATE INDEX IF NOT EXISTS idx_access_permissions_employee_doc ON access_permissions(employee_document_id);
CREATE INDEX IF NOT EXISTS idx_handover_protocols_employee_doc ON handover_protocols(employee_document_id);
CREATE INDEX IF NOT EXISTS idx_internal_directives_employee_doc ON internal_directives(employee_document_id);
CREATE INDEX IF NOT EXISTS idx_revocation_records_employee_doc ON revocation_records(employee_document_id);

-- 9. RLS (Row Level Security) Policies
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE revocation_records ENABLE ROW LEVEL SECURITY;

-- Policy pre employee_documents (len zamestnanci a admini môžu vidieť svoje dokumenty)
CREATE POLICY "Employees can view own documents" ON employee_documents
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM employees WHERE id = employee_id) OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can insert documents" ON employee_documents
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update documents" ON employee_documents
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete documents" ON employee_documents
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Podobné policies pre ostatné tabuľky
CREATE POLICY "Users can view own consents" ON gdpr_consents
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM employees WHERE id = (SELECT employee_id FROM employee_documents WHERE id = employee_document_id)) OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can manage consents" ON gdpr_consents
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 10. Triggers pre automatické updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON employee_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_consents_updated_at BEFORE UPDATE ON gdpr_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_acknowledgments_updated_at BEFORE UPDATE ON gdpr_acknowledgments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_permissions_updated_at BEFORE UPDATE ON access_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_handover_protocols_updated_at BEFORE UPDATE ON handover_protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internal_directives_updated_at BEFORE UPDATE ON internal_directives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revocation_records_updated_at BEFORE UPDATE ON revocation_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
