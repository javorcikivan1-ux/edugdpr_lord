-- Pridanie fakturačných údajov do license_requests tabuľky
-- Spustiť v Supabase SQL Editor po add_request_system.sql

-- 1. Pridanie fakturačných údajov do license_requests
DO $$
BEGIN
    -- Názov firmy
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'invoice_company_name'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN invoice_company_name TEXT;
        RAISE NOTICE 'Stĺpec invoice_company_name pridaný do license_requests';
    END IF;

    -- IČO
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'invoice_ico'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN invoice_ico TEXT;
        RAISE NOTICE 'Stĺpec invoice_ico pridaný do license_requests';
    END IF;

    -- DIČ
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'invoice_dic'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN invoice_dic TEXT;
        RAISE NOTICE 'Stĺpec invoice_dic pridaný do license_requests';
    END IF;

    -- IČ DPH
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'invoice_icdph'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN invoice_icdph TEXT;
        RAISE NOTICE 'Stĺpec invoice_icdph pridaný do license_requests';
    END IF;

    -- Sídlo firmy
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'invoice_address'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN invoice_address TEXT;
        RAISE NOTICE 'Stĺpec invoice_address pridaný do license_requests';
    END IF;

    -- E-mail pre faktúru
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'license_requests' 
        AND column_name = 'invoice_email'
    ) THEN
        ALTER TABLE license_requests ADD COLUMN invoice_email TEXT;
        RAISE NOTICE 'Stĺpec invoice_email pridaný do license_requests';
    END IF;
END $$;

-- 2. Vytvorenie indexov pre lepšiu výkonnosť
CREATE INDEX IF NOT EXISTS idx_license_requests_invoice_company ON license_requests(invoice_company_name);
CREATE INDEX IF NOT EXISTS idx_license_requests_invoice_ico ON license_requests(invoice_ico);
CREATE INDEX IF NOT EXISTS idx_license_requests_invoice_email ON license_requests(invoice_email);

-- 3. Pridanie poznámok pre budúce reference
DO $$
BEGIN
    COMMENT ON COLUMN license_requests.invoice_company_name IS 'Názov firmy pre faktúru';
    COMMENT ON COLUMN license_requests.invoice_ico IS 'IČO firmy pre faktúru';
    COMMENT ON COLUMN license_requests.invoice_dic IS 'DIČ firmy pre faktúru';
    COMMENT ON COLUMN license_requests.invoice_icdph IS 'IČ DPH firmy pre faktúru (nepovinné)';
    COMMENT ON COLUMN license_requests.invoice_address IS 'Sídlo firmy pre faktúru';
    COMMENT ON COLUMN license_requests.invoice_email IS 'E-mail pre odoslanie faktúry';
    
    RAISE NOTICE 'Fakturačné údaje boli úspešne pridané do license_requests tabuľky';
END $$;
