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
    | { text_uz: string | null; text_ru: string | null; text_kaa: string | null; type: string | null; order_no: number | null }
    | { text_uz: string | null; text_ru: string | null; text_kaa: string | null; type: string | null; order_no: number | null }[]
    | null;
  options:
    | { text_uz: string | null }
    | { text_uz: string | null }[]
    | null;
};

const THINKING_TYPES = [
  { key: "P-Á", label: "Predmetli-amaliy fikrlash", icon: "🔧", color: "from-amber-400 to-orange-500", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", questions: [1,6,11,16,21,26,31,36],
    interpretation: `Predmetli-amaliy fikrlash isker odamlarga xos. Ularni "Oltin qo'llar" deb atashadi. Ular harakat orqali ma'lumotlarni yaxshiroq o'zlashtiradi. Ular mashina haydaydi, stanoklarning yonida turadi, kompyuterlarni yig'adi.` },
  { key: "A-S", label: "Abstrakt-simvolik fikrlash", icon: "🔢", color: "from-violet-400 to-purple-600", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", questions: [2,7,12,17,22,27,32,37],
    interpretation: `Fiziklar, matematiklar, iqtisodchilar, dasturchilar, analitiklar abstrakt-simvolik fikrlashga ega. Matematik kodlar, formulalar yordamida ma'lumotlarni o'zlashtira oladi.` },
  { key: "S-L", label: "So'z-mantiqiy fikrlash", icon: "📝", color: "from-sky-400 to-blue-600", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", questions: [3,8,13,18,23,28,33,38],
    interpretation: `Olim, o'qituvchi, tarjimon, yozuvchi, filolog, jurnalist — mantiqiy fikrlash orqali o'z fikrlarini shakllantirb, xalqqa yetkazishi mumkin.` },
  { key: "K-O", label: "Ko'rgazmali-obrazli fikrlash", icon: "🎨", color: "from-rose-400 to-pink-600", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", questions: [4,9,14,19,24,29,34,39],
    interpretation: `Rassomlar, shoirlar, yozuvchilar, rejissyorlar. Arxitektor, konstruktor, dizayner ko'rgazmali obrazli fikrlash qobiliyatiga ega bo'lishi kerak.` },
  { key: "D", label: "Kreativlik", icon: "✨", color: "from-emerald-400 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", questions: [5,10,15,20,25,30,35,40],
    interpretation: `Ijodiy tafakkur qilish, muammoning standart bo'lmagan yechimlarini topish qobiliyati. Har qanday sohada iqtidorli odamlarni ajratib turadi.` },
];

function getLevel(score: number) {
  if (score <= 2) return { label: "Past (0–2)", color: "text-gray-500" };
  if (score <= 5) return { label: "O'rtacha (3–5)", color: "text-amber-600" };
  return { label: "Yuqori (6–8)", color: "text-emerald-600" };
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { submissionId } = await params;
  const supabase = createSupabaseServerClient();

  const { data: submission, error: subError } = await supabase
    .from("submissions")
    .select(`id, student_name, class_name, language, auto_score, manual_score, total_score, status,
      tests ( title_uz )`)
    .eq("id", submissionId)
    .single();

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select(`id, text_answer, auto_score, manual_score, final_score,
      questions ( text_uz, text_ru, text_kaa, type, order_no ),
      options ( text_uz )`)
    .eq("submission_id", submissionId)
    .returns<AnswerItem[]>();

  const testTitle = Array.isArray(submission?.tests)
    ? submission?.tests[0]?.title_uz
    : (submission?.tests as unknown as { title_uz: string | null } | null)?.title_uz;

  // Har bir fikrlash turi uchun ball
  const typeScores = THINKING_TYPES.map((type) => {
    const score = answers
      ? answers.reduce((sum, a) => {
          const orderNo = Array.isArray(a.questions)
            ? a.questions[0]?.order_no
            : (a.questions as { order_no: number | null } | null)?.order_no;
          if (orderNo && type.questions.includes(orderNo)) {
            return sum + (a.auto_score ?? 0);
          }
          return sum;
        }, 0)
      : 0;
    return { ...type, score };
  });

  const dominant = typeScores.reduce((a, b) => (a.score > b.score ? a : b));
  const hasTextAnswers = answers?.some((a) => {
    const q = Array.isArray(a.questions) ? a.questions[0] : a.questions;
    return q?.type === "text";
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/results"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50">
            ← Orqaga
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Natija tafsiloti</h1>
        </div>

        {subError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{subError.message}</div>
        )}

        {/* Student info */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
          {[
            { label: "O'quvchi", value: submission?.student_name },
            { label: "Sinf", value: submission?.class_name },
            { label: "Til", value: submission?.language?.toUpperCase() },
            { label: "Test", value: testTitle },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="mt-1 font-bold text-gray-900">{item.value || "—"}</p>
            </div>
          ))}
        </div>

        {/* Score summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Auto ball", value: submission?.auto_score ?? 0, color: "text-gray-900" },
            { label: "Manual ball", value: submission?.manual_score ?? 0, color: "text-blue-600" },
            { label: "Umumiy ball", value: submission?.total_score ?? 0, color: "text-violet-700", highlight: true },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl p-5 text-center shadow-sm ${item.highlight ? "bg-gradient-to-br from-violet-50 to-pink-50 border-2 border-violet-200" : "bg-white"}`}>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className={`mt-1 text-3xl font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Thinking types analysis */}
        <div className="mb-6 overflow-hidden rounded-3xl bg-white shadow-md">
          <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-4">
            <h2 className="font-black text-white">🧠 Fikrlash turlari tahlili</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Dominant */}
            <div className={`rounded-2xl border-2 ${dominant.border} ${dominant.bg} p-4`}>
              <p className={`text-xs font-bold ${dominant.text}`}>🏆 Ustunlik qiluvchi tur</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl">{dominant.icon}</span>
                <div className="flex-1">
                  <p className={`font-bold ${dominant.text}`}>{dominant.label}</p>
                  <p className="mt-1 text-xs text-gray-600">{dominant.interpretation}</p>
                </div>
                <span className={`text-xl font-black ${dominant.text}`}>{dominant.score}/8</span>
              </div>
            </div>

            {/* All types */}
            {typeScores.map((type) => {
              const lvl = getLevel(type.score);
              const percent = Math.round((type.score / 8) * 100);
              return (
                <div key={type.key} className="flex items-center gap-4">
                  <span className="text-xl w-8">{type.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{type.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${lvl.color}`}>{lvl.label}</span>
                        <span className="text-sm font-black text-gray-900">{type.score}/8</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full bg-gradient-to-r ${type.color}`}
                        style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {answersError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{answersError.message}</div>
        )}

        {/* Answers */}
        {hasTextAnswers && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Matnli javoblar (manual ball)</h2>
            {answers?.filter((a) => {
              const q = Array.isArray(a.questions) ? a.questions[0] : a.questions;
              return q?.type === "text";
            }).map((answer, index) => {
              const q = Array.isArray(answer.questions) ? answer.questions[0] : answer.questions;
              return (
                <div key={answer.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs text-gray-400">Savol #{index + 1}</p>
                  <h3 className="mt-1 font-semibold text-gray-800">{q?.text_uz || "—"}</h3>
                  <div className="mt-3 rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">{answer.text_answer || "Javob berilmagan"}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <p className="text-sm text-gray-500">Auto: <span className="font-bold">{answer.auto_score ?? 0}</span></p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-600">Manual ball:</p>
                      <ManualScoreInput answerId={answer.id} defaultValue={answer.manual_score ?? 0} />
                    </div>
                    <p className="text-sm text-gray-500">Yakuniy: <span className="font-bold text-violet-700">{answer.final_score ?? 0}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
