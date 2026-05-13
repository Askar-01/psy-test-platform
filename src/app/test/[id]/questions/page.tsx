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
          background: #ecfdf5 !important;
          border-color: #10b981 !important;
          color: #047857 !important;
        }
        .yn-no:has(input:checked) {
          background: #fef2f2 !important;
          border-color: #ef4444 !important;
          color: #b91c1c !important;
        }
        .opt:has(input:checked) {
          background: #eef2ff !important;
          border-color: #6366f1 !important;
          color: #4338ca !important;
        }
        .opt:has(input:checked) .dot {
          background: #6366f1 !important;
          border-color: #6366f1 !important;
        }
        .opt:has(input:checked) .dot-inner {
          opacity: 1 !important;
        }
        .multi:has(input:checked) {
          background: #eef2ff !important;
          border-color: #6366f1 !important;
          color: #4338ca !important;
        }
        .multi:has(input:checked) .box {
          background: #6366f1 !important;
          border-color: #6366f1 !important;
        }
        .multi:has(input:checked) .tick {
          opacity: 1 !important;
        }
        .yn-yes:hover, .yn-no:hover, .opt:hover, .multi:hover {
          background: #fafafa;
          border-color: #d4d4d8;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-100 opacity-30 blur-3xl" />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-400">Psixologik test</p>
            <h1 className="truncate text-base font-bold tracking-tight text-zinc-900">
              {testTitle || "Test"}
            </h1>
          </div>
          <div className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700">
            {total} savol
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Xatolik: {error.message}
          </div>
        )}

        <form action={submitAnswers} className="space-y-5">
          <input type="hidden" name="test_id" value={id} />
          <input type="hidden" name="submission_id" value={submission || ""} />
          <input type="hidden" name="language" value={language} />

          {questions && questions.length > 0 ? (
            questions.map((question: QuestionItem) => {
              const questionText = getLangText(question, language);

              return (
                <div
                  key={question.id}
                  className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:border-zinc-300"
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white tabular-nums">
                      {question.order_no}
                    </span>
                    <h2 className="pt-1 text-lg font-semibold leading-snug text-zinc-900">
                      {questionText || "Savol matni yo'q"}
                    </h2>
                  </div>

                  {/* HA / YO'Q */}
                  {question.type === "yes_no" && (
                    <div className="mt-5 ml-12 flex gap-3">
                      <label className="yn-yes flex flex-1 cursor-pointer items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-600 transition">
                        <input type="radio" name={`question_${question.id}`} value="yes" className="sr-only" />
                        {yesNoLabels.yes}
                      </label>
                      <label className="yn-no flex flex-1 cursor-pointer items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-600 transition">
                        <input type="radio" name={`question_${question.id}`} value="no" className="sr-only" />
                        {yesNoLabels.no}
                      </label>
                    </div>
                  )}

                  {/* BIR VARIANTLI */}
                  {question.type === "multiple_choice" && (
                    <div className="mt-5 ml-12 space-y-2">
                      {question.options?.map((option) => {
                        const optionText = getLangText(option, language);
                        return (
                          <label
                            key={option.id}
                            className="opt flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition"
                          >
                            <input type="radio" name={`question_${question.id}`} value={option.id} className="sr-only" />
                            <span className="dot relative h-5 w-5 shrink-0 rounded-full border-2 border-zinc-300 transition">
                              <span className="dot-inner absolute inset-[5px] rounded-full bg-white opacity-0 transition" />
                            </span>
                            {optionText || "—"}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* KO'P VARIANTLI */}
                  {question.type === "multi_select" && (
                    <div className="mt-5 ml-12 space-y-2">
                      <p className="text-xs font-medium text-zinc-400">{multiHint}</p>
                      {question.options?.map((option) => {
                        const optionText = getLangText(option, language);
                        return (
                          <label
                            key={option.id}
                            className="multi flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition"
                          >
                            <input type="checkbox" name={`question_${question.id}`} value={option.id} className="sr-only" />
                            <span className="box relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-zinc-300 transition">
                              <span className="tick text-[12px] font-black text-white opacity-0 transition">✓</span>
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
                      className="mt-5 ml-12 block w-[calc(100%-3rem)] min-h-[110px] rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder={placeholder}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 p-16 text-center text-zinc-400">
              Savollar topilmadi
            </div>
          )}

          <div className="sticky bottom-4 pt-2">
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-5 text-base font-semibold text-white shadow-2xl shadow-zinc-900/20 transition hover:bg-indigo-600 active:scale-[0.99]"
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
