-- =========================================================================
-- Mekteptegi jaǵday hám sharayatlardı bahalaw ushın sorawnama
-- Supabase Studio → SQL Editor'da ishga tushiring
-- =========================================================================

DO $$
DECLARE
  v_test_id   uuid;
  v_q_id      uuid;
BEGIN

  -- -----------------------------------------------------------------------
  -- 1) TEST yaratish
  -- -----------------------------------------------------------------------
  INSERT INTO tests (title_uz, title_ru, title_kaa, description_uz)
  VALUES (
    'Maktabdagi holat va sharoitlarni baholash',
    'Анкета оценки условий и ситуации в школе',
    'Mekteptegi jaǵday hám sharayatlardı bahalaw ushın sorawnama',
    'Har bir fikrni 1 dan 5 gacha shkala bo''yicha baholang. 1-yo''q, 2-ko''pincha yo''q, 3-ba''zan, 4-ko''pincha ha, 5-ha'
  )
  RETURNING id INTO v_test_id;

  -- -----------------------------------------------------------------------
  -- 2) SAVOLLAR va VARIANTLAR
  --    Har bir multiple_choice savolga 5 ta variant (ball 1-5)
  -- -----------------------------------------------------------------------

  -- Savol 1
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 1,
    'Men maktabda o''zimni qulay his qilaman.',
    'Я чувствую себя комфортно в школе.',
    'Men mektepte ózimdi qolaylı sezemen.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 2
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 2,
    'Men o''zimni xavfsiz his qilaman.',
    'Я чувствую себя в безопасности.',
    'Men ózimdi qáwipsiz sezemen.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 3
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 3,
    'Sinfdoshlarim bilan munosabatim yaxshi.',
    'У меня хорошие отношения с одноклассниками.',
    'Klaslaslarım menen qatnasım jaqsı.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 4
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 4,
    'O''qituvchilar menga hurmat bilan munosabatda bo''lishadi.',
    'Учителя относятся ко мне с уважением.',
    'Muǵallimler maǵan húrmet penen qaraydı.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 5
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 5,
    'Men maktabda kattalardan yordam so''ray olaman.',
    'Я могу обратиться за помощью к взрослым в школе.',
    'Men mektepte úlkenlerden járdem sorap múrájat etiwim múmkin.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 6
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 6,
    'O''quv yuklamalarini o''zlashtirishim qo''limdan keladi.',
    'Я справляюсь с учебной нагрузкой.',
    'Oqıw júklemesin ózlestiriw meniń qolımnan keledi.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 7
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 7,
    'Maktabda o''qish va dam olish uchun sharoitlar yaxshi.',
    'В школе хорошие условия для учёбы и отдыха.',
    'Mektepte oqıw hám dem alıw ushın sharayatlar jaqsı.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 8
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 8,
    'Men maktabda kam stressga uchrayman.',
    'Я редко испытываю стресс в школе.',
    'Men mektepte az jaǵdayda stresske ushırayman.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 9
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 9,
    'Maktabda bulling va masxarabozlik yo''q.',
    'В школе нет буллинга и насмешек.',
    'Mektepte bulling hám masqaralaw joq.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- Savol 10
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'multiple_choice', 10,
    'Maktabdagi muhit menga yoqadi.',
    'Мне нравится атмосфера в школе.',
    'Mekteptegi ortalıq maǵan unaydı.')
  RETURNING id INTO v_q_id;

  INSERT INTO options (question_id, text_uz, text_ru, text_kaa, score) VALUES
    (v_q_id, '1 — Yo''q',          '1 — Нет',           '1 — Yaq',           1),
    (v_q_id, '2 — Ko''pincha yo''q','2 — В основном нет', '2 — Kóbinese yaq',  2),
    (v_q_id, '3 — Ba''zan',        '3 — Иногда',         '3 — Geyde',         3),
    (v_q_id, '4 — Ko''pincha ha',  '4 — В основном да',  '4 — Kóbinese awa',  4),
    (v_q_id, '5 — Ha',             '5 — Да',             '5 — Awa',           5);

  -- -----------------------------------------------------------------------
  -- 3) OCHIQ SAVOLLAR (matnli javob)
  -- -----------------------------------------------------------------------

  -- Savol 11
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'text', 11,
    'Maktabda o''zingizni qulay va tinch his qilishingizga nima yordam beradi?',
    'Что помогает вам чувствовать себя комфортно и спокойно в школе?',
    'Mektepte ózińizdi qolaylı hám tınısh seziwińizge neler járdem beredi?');

  -- Savol 12
  INSERT INTO questions (test_id, type, order_no, text_uz, text_ru, text_kaa)
  VALUES (v_test_id, 'text', 12,
    'O''quvchilar uchun maktabni yaxshiroq va qulay qilish uchun neni o''zgartirish mumkin?',
    'Что можно изменить в школе, чтобы ученикам было лучше и комфортнее?',
    'Oqıwshılarǵa jaqsıraq hám qolaylıraq bolıwı ushın mektepte nelerdi ózgertiw múmkin?');

  RAISE NOTICE 'Test muvaffaqiyatli qo''shildi! test_id = %', v_test_id;

END $$;

-- Tekshirish:
SELECT t.id, t.title_kaa,
  (SELECT count(*) FROM questions WHERE test_id = t.id) AS savollar_soni
FROM tests t
ORDER BY t.created_at DESC
LIMIT 1;
