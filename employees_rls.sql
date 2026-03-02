-- Jednoduché RLS len pre SELECT a UPDATE (bez INSERT)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Politika pre SELECT
CREATE POLICY "Company admins can view their employees" ON employees
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'super_admin' OR
        company_token = (
            SELECT company_token FROM employees 
            WHERE user_id = auth.uid() 
            LIMIT 1
        )
    );

-- Politika pre UPDATE
CREATE POLICY "Company admins can update their employees" ON employees
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'super_admin' OR
        company_token = (
            SELECT company_token FROM employees 
            WHERE user_id = auth.uid() 
            LIMIT 1
        )
    );
