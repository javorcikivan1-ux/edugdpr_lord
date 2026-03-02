-- Vytvorenie tabuľky pre sledovanie pozvánok
CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255),
    company_token VARCHAR(50) NOT NULL,
    company_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Unikátny constraint pre email a company_token
    UNIQUE(email, company_token)
);

-- Index pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_invitations_company_token ON invitations(company_token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- RLS (Row Level Security) pre pozvánky
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Politika pre adminov (môžu vidieť pozvánky svojej firmy)
CREATE POLICY "Admins can view company invitations" ON invitations
    FOR SELECT USING (
        company_token IN (
            SELECT company_token FROM employees 
            WHERE user_id = auth.uid() AND position = 'ADMIN_ROOT'
        )
    );

-- Politika pre adminov (môžu vytvárať pozvánky pre svoju firmu)
CREATE POLICY "Admins can create invitations" ON invitations
    FOR INSERT WITH CHECK (
        company_token IN (
            SELECT company_token FROM employees 
            WHERE user_id = auth.uid() AND position = 'ADMIN_ROOT'
        )
    );

-- Politika pre adminov (môžu aktualizovať pozvánky svojej firmy)
CREATE POLICY "Admins can update invitations" ON invitations
    FOR UPDATE USING (
        company_token IN (
            SELECT company_token FROM employees 
            WHERE user_id = auth.uid() AND position = 'ADMIN_ROOT'
        )
    );
