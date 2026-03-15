-- Pridanie standard_licenses stĺpca do company_purchases a license_requests
-- Spustiť v Supabase SQL Editor

-- 1. Pridanie standard_licenses do license_requests
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'standard_quantity'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN standard_quantity INTEGER DEFAULT 0;
        RAISE NOTICE 'Stĺpec standard_quantity pridaný do license_requests';
    END IF;
END $$;

-- 2. Pridanie standard_licenses do company_purchases
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_purchases' 
        AND column_name = 'standard_licenses'
    ) THEN
        ALTER TABLE company_purchases ADD COLUMN standard_licenses INTEGER DEFAULT 0;
        RAISE NOTICE 'Stĺpec standard_licenses pridaný do company_purchases';
    END IF;
END $$;

-- 3. Vytvorenie indexov
CREATE INDEX IF NOT EXISTS idx_license_requests_standard ON license_requests(standard_quantity);
CREATE INDEX IF NOT EXISTS idx_company_purchases_standard ON company_purchases(standard_licenses);

-- 4. Aktualizácia existujúcich záznamov (ak existujú)
-- Pre existujúce záznamy, kde nie sú vyplnené standard_licenses, vypočítame ich
UPDATE company_purchases 
SET standard_licenses = GREATEST(0, (total_licenses OR quantity OR 0) - COALESCE(premium_licenses, 0) - COALESCE(expert_licenses, 0))
WHERE standard_licenses = 0 OR standard_licenses IS NULL;

UPDATE license_requests 
SET standard_quantity = GREATEST(0, quantity - COALESCE(premium_quantity, 0) - COALESCE(expert_quantity, 0))
WHERE standard_quantity = 0 OR standard_quantity IS NULL;

RAISE NOTICE 'Existujúce záznamy boli aktualizované';
