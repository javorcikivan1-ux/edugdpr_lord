-- Pridanie stĺpca pre typy školení do tabuľky trainings
-- Spustiť v Supabase SQL Editor

DO $$
BEGIN
    -- Pridanie stĺpca training_type, ak ešte neexistuje
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainings' 
        AND column_name = 'training_type'
    ) THEN
        ALTER TABLE trainings 
        ADD COLUMN training_type TEXT DEFAULT 'standard' 
        CHECK (training_type IN ('standard', 'premium', 'expert'));
        
        RAISE NOTICE 'Stĺpec training_type bol úspešne pridaný';
    ELSE
        RAISE NOTICE 'Stĺpec training_type už existuje';
    END IF;
END $$;

-- Aktualizácia existujúcich školení (ak existujú)
-- Toto môžeš spustiť len ak chceš aktualizovať existujúce záznamy
-- UPDATE trainings SET training_type = 'standard' WHERE training_type IS NULL;

-- Vytvorenie indexu pre lepšiu výkonnosť
CREATE INDEX IF NOT EXISTS idx_trainings_training_type ON trainings(training_type);

-- Vytvorenie RLS politiky pre training_type (ak používaš Row Level Security)
-- Toto pridaj len ak potrebuješ
-- CREATE POLICY "Training type is visible" ON trainings
-- FOR SELECT USING (training_type IN ('standard', 'premium', 'expert'));
