import Link from "next/link";
import ManualScoreInput from "../../../../components/manual-score-input";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

type SubmissionDetailPageProps = {
  params: Promise<{ submissionId: string }>;
};

type AnswerItem = {
  id: string;
  text_answer: string | null;
  auto_score: number | null;
  manual_score: number | null;
  final_score: number | null;
  questions:
    | { text_uz: string | null; text_ru: string | null; text_kaa: string | null; type: string | null }
    | { text_uz: string | null; text_ru: string | null; text_kaa: string | null; type: string | null }[]
    | null;
  options:
    | { text_uz: string | null; text_ru: string | null; text_kaa: string | null }
    | { text_uz: string | null; text_ru: string | null; text_kaa: string | null }[]
    | null;
};

type SubmissionInfo = {
  id: string;
  student_name: string | null;
  class_name: string | null;
  language: string | null;
  auto_score: number | null;
  manual_score: number | null;
  total_score: number | null;
  status: string | null;
  tests: { title_uz: string | null } | { title_uz: string | null }[] | null;
};

const YES_NO_DISPLAY: Record<string, Record<string, string>> = {
  yes: { uz: "Ha", ru: "Да", kaa: "Awa" },
  no: { uz: "Yo'q", ru: "Нет", kaa: "Joq" },
};

export default async function SubmissionDetailPage({
  params,
}: SubmissionDetailPageProps) {
  const { submissionId } = await params;
  const supabase = createSupabaseServerClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(`
      id,
      student_name,
      class_name,
      language,
      auto_score,
      manual_score,
      total_score,
      status,
      tests (
        title_uz
      )
    `)
    .eq("id", submissionId)
    .single<SubmissionInfo>();

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select(`
      id,
      text_answer,
      auto_score,
      manual_score,
      final_score,
      questions (
        text_uz,
        text_ru,
        text_kaa,
        type
      ),
      options (
        text_uz,
        text_ru,
        text_kaa
      )
    `)
    .eq("submission_id", submissionId)
    .returns<AnswerItem[]>();

  const testTitle = Array.isArray(submission?.tests)
    ? submission?.tests[0]?.title_uz
    : submission?.tests?.title_uz;

  const lang = submission?.language ?? "uz";

  function getQText(
    q: AnswerItem["questions"]
  ): string {
    const item = Array.isArray(q) ? q[0] : q;
    if (!item) return "Savol topilmadi";
    if (lang === "ru") return item.text_ru || item.text_uz || "";
    if (lang === "kaa") return item.text_kaa || item.text_uz || "";
    return item.text_uz || "";
  }

  function getOptText(
    o: AnswerItem["options"]
  ): string {
    const item = Array.isArray(o) ? o[0] : o;
    if (!item) return "-";
    if (lang === "ru") return item.text_ru || item.text_uz || "-";
    if (lang === "kaa") return item.text_kaa || item.text_uz || "-";
    return item.text_uz || "-";
  }

  function getYesNoDisplay(answer: string | null): string {
    if (!answer) return "-";
    return YES_NO_DISPLAY[answer]?.[lang] ?? answer;
  }

  const hasTextAnswers = answers?.some((a) => {
    const q = Array.isArray(a.questions) ? a.questions[0] : a.questions;
    return q?.type === "text";
  });

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/results"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            ← Orqaga
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Natija tafsiloti</h1>
        </div>

        {submissionError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {submissionError.message}
          </div>
        )}

        {/* O'quvchi ma'lumotlari */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-400">O'quvchi</p>
            <p className="mt-1 font-semibold text-gray-900">
              {submission?.student_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Sinf</p>
            <p className="mt-1 font-semibold text-gray-900">
              {submission?.class_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Til</p>
            <p className="mt-1 font-semibold text-gray-900 uppercase">
              {submission?.language || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Test</p>
            <p className="mt-1 font-semibold text-gray-900">
              {testTitle || "-"}
            </p>
          </div>
        </div>

        {/* Ball xulosasi */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="text-xs text-gray-400">Auto ball</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {submission?.auto_score ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="text-xs text-gray-400">Manual ball</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {submission?.manual_score ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
            <p className="text-xs text-blue-500">Umumiy ball</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {submission?.total_score ?? 0}
            </p>
          </div>
        </div>

        {answersError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {answersError.message}
          </div>
        )}

        {/* Javoblar */}
        <div className="mt-8 space-y-4">
          {answers && answers.length > 0 ? (
            answers.map((answer, index) => {
              const questionType = Array.isArray(answer.questions)
                ? answer.questions[0]?.type
                : answer.questions?.type;

              const isTextType = questionType === "text";
              const isYesNo = questionType === "yes_no";

              return (
                <div
                  key={answer.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Savol #{index + 1}</p>
                      <h2 className="mt-1 text-base font-semibold text-gray-900">
                        {getQText(answer.questions)}
                      </h2>
                    </div>
                    <span className="ml-4 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                      {questionType || "-"}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4 space-y-2">
                    {/* Tanlangan variant */}
                    {!isTextType && !isYesNo && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">Javob:</span>{" "}
                        <span className="text-gray-900">
                          {getOptText(answer.options)}
                        </span>
                      </p>
                    )}

                    {/* Ha/Yo'q */}
                    {isYesNo && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">Javob:</span>{" "}
                        <span className="text-gray-900">
                          {getYesNoDisplay(answer.text_answer)}
                        </span>
                      </p>
                    )}

                    {/* Matnli javob */}
                    {isTextType && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">Yozma javob:</span>{" "}
                        <span className="text-gray-900">
                          {answer.text_answer || "—"}
                        </span>
                      </p>
                    )}

                    <div className="flex items-center gap-6 pt-1">
                      <p className="text-sm text-gray-500">
                        Auto ball:{" "}
                        <span className="font-semibold text-gray-800">
                          {answer.auto_score ?? 0}
                        </span>
                      </p>

                      {/* Matnli savolga manual ball */}
                      {isTextType && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-600">
                            Manual ball:
                          </p>
                          <ManualScoreInput
                            answerId={answer.id}
                            defaultValue={answer.manual_score ?? 0}
                          />
                        </div>
                      )}

                      <p className="text-sm text-gray-500">
                        Yakuniy:{" "}
                        <span className="font-semibold text-blue-700">
                          {answer.final_score ?? 0}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-500">
              Javoblar topilmadi
            </div>
          )}
        </div>

        {hasTextAnswers && (
          <p className="mt-4 text-sm text-gray-400">
            * Matnli savollarga manual ball kiritgandan so'ng umumiy ball avtomatik yangilanadi.
          </p>
        )}
      </div>
    </main>
  );
}
