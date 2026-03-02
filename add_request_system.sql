-- Doplnenie systému dopytov a licencií pre 3 typy školení
-- Spustiť v Supabase SQL Editor po add_expert_training_type.sql

-- 1. Pridanie expert_quantity do license_requests
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'expert_quantity'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN expert_quantity INTEGER DEFAULT 0;
        RAISE NOTICE 'Stĺpec expert_quantity pridaný do license_requests';
    END IF;
END $$;

-- 2. Pridanie expert_licenses do company_purchases
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_purchases' 
        AND column_name = 'expert_licenses'
    ) THEN
        ALTER TABLE company_purchases ADD COLUMN expert_licenses INTEGER DEFAULT 0;
        RAISE NOTICE 'Stĺpec expert_licenses pridaný do company_purchases';
    END IF;
END $$;

-- 3. Pridanie training_type do employees
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'training_type'
    ) THEN
        ALTER TABLE employees ADD COLUMN training_type TEXT DEFAULT 'standard';
        
        -- Pridanie constraint pre validné hodnoty
        ALTER TABLE employees 
        ADD CONSTRAINT employee_training_type_check 
        CHECK (training_type IN ('standard', 'premium', 'expert'));
        
        RAISE NOTICE 'Stĺpec training_type pridaný do employees';
    END IF;
END $$;

-- 4. Vytvorenie indexov pre lepšiu výkonnosť
CREATE INDEX IF NOT EXISTS idx_license_requests_expert ON license_requests(expert_quantity);
CREATE INDEX IF NOT EXISTS idx_company_purchases_expert ON company_purchases(expert_licenses);
CREATE INDEX IF NOT EXISTS idx_employees_training_type ON employees(training_type);

-- 5. Voliteľné: Konverzia existujúcich zamestnancov (ak existuje is_premium)
DO $$
BEGIN
    -- Ak existuje is_premium stĺpec v employees
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'is_premium'
    ) THEN
        UPDATE employees 
        SET training_type = CASE 
            WHEN is_premium = true THEN 'premium'
            ELSE 'standard'
        END
        WHERE training_type IS NULL;
        
        RAISE NOTICE 'Existujúci zamestnanci boli konvertovaní na training_type';
    END IF;
END $$;

-- 6. Voliteľné: Odstránenie starých stĺpcov (po overení)
-- ALTER TABLE employees DROP COLUMN IF EXISTS is_premium;
