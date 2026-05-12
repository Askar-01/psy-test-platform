-- =========================================================================
-- Migration 001: multi_select savol turini qo'shish
-- =========================================================================
-- Bu migratsiyani Supabase Studio -> SQL Editor'da bir marta ishga tushiring.
-- Mavjud ma'lumot buzilmaydi.
-- =========================================================================

-- 1) `answers` jadvaliga selected_option_ids ustunini qo'shish.
--    multi_select uchun bir nechta UUID saqlaydi.
--    multiple_choice/yes_no/text uchun NULL bo'ladi (eski yozuvlar saqlanadi).
ALTER TABLE answers
  ADD COLUMN IF NOT EXISTS selected_option_ids uuid[] NULL;

-- 2) `questions.type` CHECK constraint'ini yangilash (agar mavjud bo'lsa).
--    Avval mavjud constraint'ni topib, qaytadan yaratamiz.
DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'questions'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%type%';

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE questions DROP CONSTRAINT %I', cname);
  END IF;

  -- Yangi constraint: 4 ta tur ruxsat etiladi
  ALTER TABLE questions
    ADD CONSTRAINT questions_type_check
    CHECK (type IN ('yes_no', 'multiple_choice', 'multi_select', 'text'));
END$$;

-- 3) Tekshiruv:
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'answers'
  AND column_name IN ('selected_option_id', 'selected_option_ids', 'text_answer');
