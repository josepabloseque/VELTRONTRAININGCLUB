-- ====================================================================
-- VELTRON TRAINING CLUB: Generador Automático de Clases y Entrenamientos
-- Horarios por defecto (Lunes a Viernes):
--   • Entrenamientos Libres (Cupo 999): 6:00 AM - 11:00 AM, 4:00 PM - 9:00 PM
--   • Clases Dirigidas (Cupo 12): 6:00 AM, 7:00 AM, 5:30 PM, 7:30 PM
-- Fines de semana (Sábado y Domingo): Sin clases por defecto
-- ====================================================================

-- 1. Crear o reemplazar la función generadora
CREATE OR REPLACE FUNCTION generate_default_classes(p_days_ahead INT DEFAULT 90)
RETURNS VOID AS $$
DECLARE
    curr_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL;
    guided_times TEXT[] := ARRAY['6:00 AM', '7:00 AM', '5:30 PM', '7:30 PM'];
    free_times TEXT[] := ARRAY['6:00 AM - 11:00 AM', '4:00 PM - 9:00 PM'];
    t TEXT;
BEGIN
    WHILE curr_date <= end_date LOOP
        -- DOW: 1 = Lunes a 5 = Viernes (Excluye 0 = Domingo y 6 = Sábado)
        IF EXTRACT(DOW FROM curr_date) BETWEEN 1 AND 5 THEN
            -- A) Insertar Entrenamientos Libres (Cupo 999)
            FOREACH t IN ARRAY free_times LOOP
                IF NOT EXISTS (
                    SELECT 1 FROM classes 
                    WHERE date = curr_date 
                      AND time = t
                ) THEN
                    INSERT INTO classes (title, date, time, capacity, booked_count)
                    VALUES ('Entrenamiento Libre', curr_date, t, 999, 0);
                END IF;
            END LOOP;

            -- B) Insertar Clases Dirigidas (Cupo 12)
            FOREACH t IN ARRAY guided_times LOOP
                IF NOT EXISTS (
                    SELECT 1 FROM classes 
                    WHERE date = curr_date 
                      AND time = t
                ) THEN
                    INSERT INTO classes (title, date, time, capacity, booked_count)
                    VALUES ('Clase Dirigida', curr_date, t, 12, 0);
                END IF;
            END LOOP;
        END IF;
        curr_date := curr_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ejecutar para los próximos 90 días
SELECT generate_default_classes(90);

-- 3. Programar la automatización para cada domingo a las 00:00 UTC
SELECT cron.schedule(
    'auto-generate-weekday-classes',
    '0 0 * * 0',
    'SELECT generate_default_classes(30);'
);
