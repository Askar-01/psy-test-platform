-- =========================================================================
-- Migration 002: Barcha jadvallarga RLS yoqish
-- =========================================================================
-- Bu migratsiyani Supabase Studio -> SQL Editor'da bir marta ishga tushiring.
-- service_role kaliti RLS'ni avtomatik bypass qiladi — server kodi ishlaydi.
-- Anon kalit uchun hech qanday policy yo'q: deny by default.
-- =========================================================================

ALTER TABLE tests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers        ENABLE ROW LEVEL SECURITY;

-- Tekshiruv: RLS holati
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
