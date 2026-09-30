-- ====================================================================
-- VELTRON TRAINING CLUB: Generador Automático de Clases Dirigidas
-- Horarios por defecto (Lunes a Viernes): 6:00 AM, 7:00 AM, 5:30 PM, 7:30 PM
-- Cupos: 12
-- Fines de semana (Sábado y Domingo): Sin clases por defecto
-- ====================================================================

-- 1. Crear la función generadora de clases por defecto con tipos exactos
CREATE OR REPLACE FUNCTION generate_default_classes(p_days_ahead INT DEFAULT 90)
RETURNS VOID AS $$
DECLARE
    curr_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL;
    class_times TEXT[] := ARRAY['6:00 AM', '7:00 AM', '5:30 PM', '7:30 PM'];
    t TEXT;
BEGIN
    WHILE curr_date <= end_date LOOP
        -- DOW: 1 = Lunes a 5 = Viernes (Excluye 0 = Domingo y 6 = Sábado)
        IF EXTRACT(DOW FROM curr_date) BETWEEN 1 AND 5 THEN
            FOREACH t IN ARRAY class_times LOOP
                -- Protección contra duplicados usando tipo DATE directo
                IF NOT EXISTS (
                    SELECT 1 FROM classes 
                    WHERE date = curr_date 
                      AND time = t
                ) THEN
                    INSERT INTO classes (title, date, time, capacity, booked_count)
                    VALUES ('Clases Dirigidas', curr_date, t, 12, 0);
                END IF;
            END LOOP;
        END IF;
        curr_date := curr_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear las clases de los próximos 90 días de inmediato
SELECT generate_default_classes(90);

-- 3. Programar la automatización para cada domingo a las 00:00 UTC
SELECT cron.schedule(
    'auto-generate-weekday-classes',
    '0 0 * * 0',
    'SELECT generate_default_classes(30);'
);
