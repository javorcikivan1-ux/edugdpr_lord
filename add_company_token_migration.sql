-- Add company_token column to companies table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'company_token') THEN
        ALTER TABLE companies ADD COLUMN company_token TEXT UNIQUE;
    END IF;
END $$;

-- Create index for company_token
CREATE INDEX IF NOT EXISTS idx_companies_company_token ON companies(company_token);

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for companies
CREATE POLICY "Company owners can view their company" ON companies
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'super_admin' OR
        user_id = auth.uid()
    );

-- Update existing companies with company_token from employees if they exist
UPDATE companies
SET company_token = (
    SELECT company_token
    FROM employees
    WHERE employees.user_id = companies.user_id
    LIMIT 1
)
WHERE company_token IS NULL;

-- For companies without employees, generate token
UPDATE companies
SET company_token = 'LB-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE company_token IS NULL;
