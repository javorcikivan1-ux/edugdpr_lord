-- Aktualizácia existujúcich záznamov pre standard_quantity
-- Spustiť v Supabase SQL Editor

UPDATE license_requests 
SET standard_quantity = GREATEST(0, quantity - COALESCE(premium_quantity, 0) - COALESCE(expert_quantity, 0))
WHERE standard_quantity IS NULL OR standard_quantity = 0;
