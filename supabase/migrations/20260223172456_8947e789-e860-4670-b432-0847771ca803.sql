DO $$
DECLARE
  app RECORD;
  new_short_id TEXT;
  new_token TEXT;
  attempt INT;
  done BOOLEAN;
BEGIN
  FOR app IN
    SELECT id, onboarding_token, onboarding_status
    FROM coach_applications
    WHERE status = 'approved'
      AND onboarding_short_id IS NULL
      AND (onboarding_status IS NULL OR onboarding_status IN ('pending', 'needs_changes'))
  LOOP
    -- Generate token if missing (Barnes Lam case)
    new_token := COALESCE(
      app.onboarding_token,
      replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
    );

    done := FALSE;
    FOR attempt IN 1..5 LOOP
      new_short_id := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

      BEGIN
        -- Insert onboarding_links row
        INSERT INTO onboarding_links (short_id, application_id, onboarding_token, expires_at)
        VALUES (new_short_id, app.id, new_token, now() + interval '30 days');

        -- Update coach_applications
        UPDATE coach_applications
        SET onboarding_short_id = new_short_id,
            onboarding_token = new_token,
            onboarding_status = COALESCE(onboarding_status, 'pending')
        WHERE id = app.id;

        done := TRUE;
        EXIT; -- break retry loop on success
      EXCEPTION WHEN unique_violation THEN
        -- Retry with new short_id
        CONTINUE;
      END;
    END LOOP;

    IF NOT done THEN
      RAISE WARNING 'Failed to generate unique short_id for application %', app.id;
    END IF;
  END LOOP;
END $$;