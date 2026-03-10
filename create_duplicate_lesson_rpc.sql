-- RPC funkcia pre duplikovanie lekcií medzi školeniami (iba pre superadmin)
CREATE OR REPLACE FUNCTION duplicate_lesson_to_training(
    lesson_id UUID,
    target_training_id UUID,
    current_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    source_lesson RECORD;
    target_training RECORD;
    next_order_index INTEGER;
    user_role TEXT;
    user_email TEXT;
    duplicated_lesson UUID;
    result JSON;
BEGIN
    -- Overenie, či je superadmin
    SELECT 
        raw_user_meta_data->>'role' as role,
        email
    INTO user_role, user_email
    FROM auth.users
    WHERE id = current_user_id;
    
    IF user_role != 'SUPER_ADMIN' AND user_email != 'sluzby@lordsbenison.eu' THEN
        result := json_build_object('error', 'Insufficient permissions - super admin required');
        RETURN result;
    END IF;
    
    -- Získať detaily zdrojovej lekcie
    SELECT * INTO source_lesson
    FROM training_modules
    WHERE id = lesson_id;
    
    IF source_lesson IS NULL THEN
        result := json_build_object('error', 'Source lesson not found');
        RETURN result;
    END IF;
    
    -- Overiť, či cieľové školenie existuje
    SELECT id, title INTO target_training
    FROM trainings
    WHERE id = target_training_id;
    
    IF target_training IS NULL THEN
        result := json_build_object('error', 'Target training not found');
        RETURN result;
    END IF;
    
    -- Zistiť najvyššie order_index pre cieľové školenie
    SELECT COALESCE(MAX(order_index), 0) + 1 INTO next_order_index
    FROM training_modules
    WHERE training_id = target_training_id;
    
    -- Vytvoriť duplikát lekcie
    INSERT INTO training_modules (
        training_id,
        title,
        content,
        description,
        module_type,
        video_url,
        quiz_questions,
        duration_minutes,
        is_mandatory,
        order_index
    ) VALUES (
        target_training_id,
        source_lesson.title,
        source_lesson.content,
        source_lesson.description,
        source_lesson.module_type,
        source_lesson.video_url,
        source_lesson.quiz_questions,
        source_lesson.duration_minutes,
        source_lesson.is_mandatory,
        next_order_index
    ) RETURNING id INTO duplicated_lesson;
    
    -- Vrátiť úspešný výsledok
    result := json_build_object(
        'success', true,
        'duplicated_lesson_id', duplicated_lesson,
        'message', format('Lekcia "%s" bola úspešne duplikovaná do školenia "%s"', source_lesson.title, target_training.title)
    );
    
    RETURN result;
END;
$$;

-- Pridať oprávnenia pre RPC funkciu
GRANT EXECUTE ON FUNCTION duplicate_lesson_to_training TO authenticated;
