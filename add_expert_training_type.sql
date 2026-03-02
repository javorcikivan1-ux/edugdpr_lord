-- Pridanie expert typu školenia k existujúcim standard/premium
-- Spustiť v Supabase SQL Editor

DO $$
BEGIN
    -- 1. Pridanie nového stĺpca training_type, ak ešte neexistuje
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainings' 
        AND column_name = 'training_type'
    ) THEN
        ALTER TABLE trainings 
        ADD COLUMN training_type TEXT;
        
        RAISE NOTICE 'Stĺpec training_type bol pridaný';
    END IF;
    
    -- 2. Konverzia existujúcich dát z is_premium na training_type
    -- Ak existuje is_premium stĺpec
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainings' 
        AND column_name = 'is_premium'
    ) THEN
        -- Premigruj dáta: is_premium = true → 'premium', is_premium = false → 'standard'
        UPDATE trainings 
        SET training_type = CASE 
            WHEN is_premium = true THEN 'premium'
            ELSE 'standard'
        END
        WHERE training_type IS NULL;
        
        RAISE NOTICE 'Dáta boli premigrované z is_premium na training_type';
    END IF;
    
    -- 3. Nastavenie default hodnoty pre nové záznamy
    ALTER TABLE trainings 
    ALTER COLUMN training_type SET DEFAULT 'standard';
    
    -- 4. Pridanie CHECK constraint pre 3 typy
    ALTER TABLE trainings 
    ADD CONSTRAINT training_type_check 
    CHECK (training_type IN ('standard', 'premium', 'expert'));
    
    RAISE NOTICE 'Constraint pre training_type bol pridaný';
    
END $$;

-- Vytvorenie indexu pre lepšiu výkonnosť
CREATE INDEX IF NOT EXISTS idx_trainings_training_type ON trainings(training_type);

-- Voliteľné: Odstránenie starého is_premium stĺpca (po overení, že všetko funguje)
-- ALTER TABLE trainings DROP COLUMN IF EXISTS is_premium;
