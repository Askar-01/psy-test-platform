export const dynamic = "force-dynamic";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { submitAnswers } from "./actions";

type TestPageProps = {
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
  uz: { yes: "Ha", no: "Yo'q" },
  ru: { yes: "Да", no: "Нет" },
  kaa: { yes: "Awa", no: "Joq" },
};

const SUBMIT_LABEL: Record<string, string> = {
  uz: "Javoblarni yuborish",
  ru: "Отправить ответы",
  kaa: "Jawaplardy jiberiw",
};

const MULTI_HINT: Record<string, string> = {
  uz: "Bir nechta variantni tanlash mumkin",
  ru: "Можно выбрать несколько вариантов",
  kaa: "Bir neshe variantty tańlawǵa boladı",
};

const PLACEHOLDER: Record<string, string> = {
  uz: "Javobingizni yozing...",
  ru: "Напишите свой ответ...",
  kaa: "Jawabıńızdı jazıń...",
};

export default async function QuestionsPage({ params, searchParams }: TestPageProps) {
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
  const multiHint = MULTI_HINT[language] ?? MULTI_HINT.uz;
  const placeholder = PLACEHOLDER[language] ?? PLACEHOLDER.uz;
  const total = questions?.length ?? 0;

  return (
    <main className="min-h-screen bg-white">
      <style>{`
        .yn-yes:has(input:checked) {
          background: #2563eb !important;
          border-color: #2563eb !important;
          color: #fff !important;
        }
        .yn-no:has(input:checked) {
          background: #18181b !important;
          border-color: #18181b !important;
          color: #facc15 !important;
        }
        .opt:has(input:checked) {
          background: #facc15 !important;
          border-color: #18181b !important;
          color: #18181b !important;
        }
        .opt:has(input:checked) .dot {
          background: #18181b !important;
          border-color: #18181b !important;
        }
        .opt:has(input:checked) .dot-inner {
          opacity: 1 !important;
          background: #facc15 !important;
        }
        .multi:has(input:checked) {
          background: #2563eb !important;
          border-color: #18181b !important;
          color: #fff !important;
        }
        .multi:has(input:checked) .box {
          background: #facc15 !important;
          border-color: #facc15 !important;
        }
        .multi:has(input:checked) .tick {
          opacity: 1 !important;
          color: #18181b !important;
        }
        .yn-yes:hover, .yn-no:hover, .opt:hover, .multi:hover {
          border-color: #18181b;
        }
      `}</style>

      {/* Top header (sticky) */}
      <div className="sticky top-0 z-20 border-b-2 border-zinc-900 bg-zinc-900 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
              / Psixologik test
            </p>
            <h1 className="truncate text-base font-black uppercase tracking-tight">
              {testTitle || "Test"}
            </h1>
          </div>
          <div className="ml-4 shrink-0 border-2 border-yellow-400 bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-widest text-zinc-900">
            {String(total).padStart(2, "0")} savol
          </div>
        </div>
        <div className="h-1 w-full bg-yellow-400" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        {error && (
          <div className="mb-6 border-2 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700">
            Xatolik: {error.message}
          </div>
        )}

        <form action={submitAnswers} className="space-y-6">
          <input type="hidden" name="test_id" value={id} />
          <input type="hidden" name="submission_id" value={submission || ""} />
          <input type="hidden" name="language" value={language} />

          {questions && questions.length > 0 ? (
            questions.map((question: QuestionItem) => {
              const questionText = getLangText(question, language);

              return (
                <div
                  key={question.id}
                  className="border-2 border-zinc-900 bg-white"
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between border-b-2 border-zinc-900 bg-zinc-900 px-5 py-2.5 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                      / Savol {String(question.order_no).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {question.type === "yes_no" && "Ha / Yo'q"}
                      {question.type === "multiple_choice" && "1 variant"}
                      {question.type === "multi_select" && "Ko'p variant"}
                      {question.type === "text" && "Matnli"}
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-black leading-snug text-zinc-900">
                      {questionText || "Savol matni yo'q"}
                    </h2>

                    {/* HA / YO'Q */}
                    {question.type === "yes_no" && (
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <label className="yn-yes flex cursor-pointer items-center justify-center border-2 border-zinc-300 bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-zinc-700 transition">
                          <input type="radio" name={`question_${question.id}`} value="yes" className="sr-only" />
                          ✓ {yesNoLabels.yes}
                        </label>
                        <label className="yn-no flex cursor-pointer items-center justify-center border-2 border-zinc-300 bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-zinc-700 transition">
                          <input type="radio" name={`question_${question.id}`} value="no" className="sr-only" />
                          ✗ {yesNoLabels.no}
                        </label>
                      </div>
                    )}

                    {/* BIR VARIANTLI */}
                    {question.type === "multiple_choice" && (
                      <div className="mt-6 space-y-2">
                        {question.options?.map((option) => {
                          const optionText = getLangText(option, language);
                          return (
                            <label
                              key={option.id}
                              className="opt flex cursor-pointer items-center gap-3 border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition"
                            >
                              <input type="radio" name={`question_${question.id}`} value={option.id} className="sr-only" />
                              <span className="dot relative h-5 w-5 shrink-0 border-2 border-zinc-400 transition">
                                <span className="dot-inner absolute inset-[3px] bg-transparent opacity-0 transition" />
                              </span>
                              {optionText || "—"}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* KO'P VARIANTLI */}
                    {question.type === "multi_select" && (
                      <div className="mt-6 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          ⓘ {multiHint}
                        </p>
                        {question.options?.map((option) => {
                          const optionText = getLangText(option, language);
                          return (
                            <label
                              key={option.id}
                              className="multi flex cursor-pointer items-center gap-3 border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition"
                            >
                              <input type="checkbox" name={`question_${question.id}`} value={option.id} className="sr-only" />
                              <span className="box relative flex h-5 w-5 shrink-0 items-center justify-center border-2 border-zinc-400 transition">
                                <span className="tick text-[11px] font-black opacity-0 transition">✓</span>
                              </span>
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
                        className="mt-6 block w-full min-h-[120px] border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600"
                        placeholder={placeholder}
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border-2 border-dashed border-zinc-300 p-16 text-center text-sm font-bold uppercase tracking-widest text-zinc-400">
              Savollar topilmadi
            </div>
          )}

          <div className="sticky bottom-4 pt-4">
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 border-2 border-zinc-900 bg-yellow-400 py-5 text-sm font-black uppercase tracking-widest text-zinc-900 shadow-2xl shadow-zinc-900/30 transition hover:bg-zinc-900 hover:text-yellow-400"
            >
              {submitLabel}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
