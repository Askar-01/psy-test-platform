import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { submitAnswers } from "./actions";

type QuestionsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submission?: string }>;
};

type OptionItem = {
  id: string;
  text_uz: string | null;
  text_ru: string | null;
  text_kaa: string | null;
  score: number | null;
};

type QuestionItem = {
  id: string;
  type: string;
  order_no: number;
  text_uz: string | null;
  text_ru: string | null;
  text_kaa: string | null;
  options: OptionItem[];
};

function getLangText(
  item: { text_uz?: string | null; text_ru?: string | null; text_kaa?: string | null },
  lang: string
): string {
  if (lang === "ru") return item.text_ru || item.text_uz || "";
  if (lang === "kaa") return item.text_kaa || item.text_uz || "";
  return item.text_uz || "";
}

const YES_NO_LABELS: Record<string, { yes: string; no: string }> = {
  uz: { yes: "Ha ✓", no: "Yo'q ✗" },
  ru: { yes: "Да ✓", no: "Нет ✗" },
  kaa: { yes: "Awa ✓", no: "Joq ✗" },
};

const SUBMIT_LABEL: Record<string, string> = {
  uz: "Javoblarni yuborish 🚀",
  ru: "Отправить ответы 🚀",
  kaa: "Jawaplardy jiberiw 🚀",
};

export default async function QuestionsPage({ params, searchParams }: QuestionsPageProps) {
  const { id } = await params;
  const { submission } = await searchParams;
  const supabase = createSupabaseServerClient();

  let language = "uz";
  if (submission) {
    const { data: sub } = await supabase
      .from("submissions")
      .select("language")
      .eq("id", submission)
      .single();
    language = sub?.language ?? "uz";
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id, title_uz, title_ru, title_kaa")
    .eq("id", id)
    .single();

  const { data: questions, error } = await supabase
    .from("questions")
    .select(`id, type, order_no, text_uz, text_ru, text_kaa,
      options ( id, text_uz, text_ru, text_kaa, score )`)
    .eq("test_id", id)
    .order("order_no", { ascending: true });

  const testTitle = getLangText(
    { text_uz: test?.title_uz, text_ru: test?.title_ru, text_kaa: test?.title_kaa },
    language
  );
  const yesNoLabels = YES_NO_LABELS[language] ?? YES_NO_LABELS.uz;
  const submitLabel = SUBMIT_LABEL[language] ?? SUBMIT_LABEL.uz;
  const total = questions?.length ?? 0;

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #1a1a6e 40%, #2d1b8e 70%, #1e0a5c 100%)" }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10" style={{ background: "rgba(10,10,46,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Psixologik test</p>
            <h1 className="text-lg font-black text-white">{testTitle || "Test"}</h1>
          </div>
          <div className="rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            {total} ta savol
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl p-4" style={{ background: "rgba(255,100,100,0.15)", border: "1px solid rgba(255,100,100,0.3)", color: "#ff9999" }}>
            Xatolik: {error.message}
          </div>
        )}

        <form action={submitAnswers} className="space-y-4">
          <input type="hidden" name="test_id" value={id} />
          <input type="hidden" name="submission_id" value={submission || ""} />
          <input type="hidden" name="language" value={language} />

          {questions && questions.length > 0 ? (
            questions.map((question: QuestionItem, idx) => {
              const questionText = getLangText(question, language);
              const progress = Math.round(((idx + 1) / total) * 100);

              return (
                <div
                  key={question.id}
                  className="overflow-hidden rounded-3xl transition"
                  style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {/* Progress bar */}
                  <div className="h-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #4040cc, #9020cc)" }}
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-md"
                        style={{ background: "linear-gradient(135deg, #4040cc, #9020cc)" }}
                      >
                        {question.order_no}
                      </div>
                      <h2 className="pt-1.5 text-base font-semibold leading-snug text-white">
                        {questionText || "Savol matni yo'q"}
                      </h2>
                    </div>

                    {/* HA / YO'Q */}
                    {question.type === "yes_no" && (
                      <div className="mt-5 flex gap-3">
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition has-[:checked]:shadow-lg"
                          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                        >
                          <input type="radio" name={`question_${question.id}`} value="yes" className="sr-only" />
                          <style>{`
                            input[name="question_${question.id}"][value="yes"]:checked ~ * { color: #4ade80; }
                          `}</style>
                          {yesNoLabels.yes}
                        </label>
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition"
                          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                        >
                          <input type="radio" name={`question_${question.id}`} value="no" className="sr-only" />
                          {yesNoLabels.no}
                        </label>
                      </div>
                    )}

                    {/* KO'P TANLOVLI */}
                    {question.type === "multiple_choice" && (
                      <div className="mt-5 space-y-2">
                        {question.options?.map((option) => {
                          const optionText = getLangText(option, language);
                          return (
                            <label
                              key={option.id}
                              className="flex cursor-pointer items-center gap-3 rounded-2xl px-5 py-3 text-sm transition has-[:checked]:font-semibold"
                              style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                            >
                              <input type="radio" name={`question_${question.id}`} value={option.id} className="sr-only" />
                              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-current" />
                              {optionText || "—"}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* MATNLI */}
                    {question.type === "text" && (
                      <textarea
                        name={`question_${question.id}`}
                        className="mt-5 min-h-[100px] w-full rounded-2xl px-5 py-3 text-sm text-white outline-none transition placeholder:text-white/30"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}
                        placeholder={
                          language === "ru" ? "Напишите свой ответ..."
                          : language === "kaa" ? "Jawabıńızdı jazıń..."
                          : "Javobingizni yozing..."
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl p-10 text-center" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              Savollar topilmadi
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-3xl py-5 text-lg font-black text-white shadow-xl transition hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4040cc, #9020cc)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
