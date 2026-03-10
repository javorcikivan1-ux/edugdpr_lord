-- Pridanie stĺpca company_name do tabuľky employees
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'company_name'
    ) THEN
        ALTER TABLE employees ADD COLUMN company_name TEXT;
        RAISE NOTICE 'Stĺpec company_name pridaný do employees';
    END IF;
END $$;

-- Aktualizácia existujúcich záznamov na základe companies tabuľky
UPDATE employees 
SET company_name = companies.name 
FROM companies 
WHERE employees.company_token = companies.id::TEXT 
AND employees.company_name IS NULL;

COMMENT ON COLUMN employees.company_name IS 'Názov firmy zamestnanca';
