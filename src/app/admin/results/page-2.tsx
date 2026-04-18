import Link from "next/link";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

type ResultPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submission?: string }>;
};

const THINKING_TYPES = [
  {
    key: "P-Á",
    label_uz: "Predmetli-amaliy",
    label_ru: "Предметно-действенный",
    label_kaa: "Predmetli-ámeliy",
    icon: "🔧",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    questions: [1, 6, 11, 16, 21, 26, 31, 36],
  },
  {
    key: "A-S",
    label_uz: "Abstrakt-simvolik",
    label_ru: "Абстрактно-символический",
    label_kaa: "Abstrakt-simvollıq",
    icon: "🔢",
    color: "from-violet-400 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    questions: [2, 7, 12, 17, 22, 27, 32, 37],
  },
  {
    key: "S-L",
    label_uz: "So'z-mantiqiy",
    label_ru: "Словесно-логический",
    label_kaa: "Sóz-logikalıq",
    icon: "📝",
    color: "from-sky-400 to-blue-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    questions: [3, 8, 13, 18, 23, 28, 33, 38],
  },
  {
    key: "K-O",
    label_uz: "Ko'rgazmali-obrazli",
    label_ru: "Наглядно-образный",
    label_kaa: "Kórgizbeli-obrazlı",
    icon: "🎨",
    color: "from-rose-400 to-pink-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    questions: [4, 9, 14, 19, 24, 29, 34, 39],
  },
  {
    key: "D",
    label_uz: "Kreativlik",
    label_ru: "Креативность",
    label_kaa: "Dóretiwshilik",
    icon: "✨",
    color: "from-emerald-400 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    questions: [5, 10, 15, 20, 25, 30, 35, 40],
  },
];

function getLevel(score: number): { label: string; color: string } {
  if (score <= 2) return { label: "Past", color: "text-gray-400" };
  if (score <= 5) return { label: "O'rtacha", color: "text-amber-500" };
  return { label: "Yuqori", color: "text-emerald-600" };
}

export default async function ResultPage({ params, searchParams }: ResultPageProps) {
  const { id } = await params;
  const { submission } = await searchParams;
  const supabase = createSupabaseServerClient();

  const { data: submissionData } = await supabase
    .from("submissions")
    .select("student_name, auto_score, total_score, language")
    .eq("id", submission ?? "")
    .single();

  // Har bir savol uchun javoblarni olish
  const { data: answers } = await supabase
    .from("answers")
    .select(`
      auto_score,
      text_answer,
      questions ( order_no )
    `)
    .eq("submission_id", submission ?? "");

  const lang = submissionData?.language ?? "uz";

  // Har bir fikrlash turi uchun ball hisoblash
  const typeScores = THINKING_TYPES.map((type) => {
    const score = answers
      ? answers.reduce((sum, a) => {
          const orderNo = Array.isArray(a.questions)
            ? a.questions[0]?.order_no
            : (a.questions as { order_no: number } | null)?.order_no;
          if (orderNo && type.questions.includes(orderNo)) {
            return sum + (a.auto_score ?? 0);
          }
          return sum;
        }, 0)
      : 0;
    return { ...type, score };
  });

  const dominant = typeScores.reduce((a, b) => (a.score > b.score ? a : b));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Congratulations banner */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 p-8 text-center text-white shadow-2xl shadow-purple-200">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-3 text-3xl font-black">Natijangiz!</h1>
          {submissionData?.student_name && (
            <p className="mt-2 text-lg text-white/80">{submissionData.student_name}</p>
          )}
          <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/20 px-6 py-3 backdrop-blur-sm">
            <span className="text-4xl font-black">{submissionData?.total_score ?? 0}</span>
            <span className="text-left text-sm text-white/80">
              umumiy<br />ball
            </span>
          </div>
        </div>

        {/* Dominant type */}
        <div className={`mt-6 rounded-3xl border-2 ${dominant.border} ${dominant.bg} p-6 shadow-md`}>
          <p className={`text-sm font-bold ${dominant.text}`}>🏆 Ustunlik qiluvchi fikrlash turi</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl">{dominant.icon}</span>
            <div>
              <h2 className={`text-xl font-black ${dominant.text}`}>
                {lang === "ru" ? dominant.label_ru : lang === "kaa" ? dominant.label_kaa : dominant.label_uz}
              </h2>
              <p className={`text-sm ${dominant.text} opacity-70`}>Ball: {dominant.score} / 8</p>
            </div>
          </div>
        </div>

        {/* All types */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Barcha ko'rsatkichlar</h3>
          {typeScores.map((type) => {
            const level = getLevel(type.score);
            const percent = Math.round((type.score / 8) * 100);
            return (
              <div key={type.key} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-4 p-4">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        {lang === "ru" ? type.label_ru : lang === "kaa" ? type.label_kaa : type.label_uz}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${level.color}`}>{level.label}</span>
                        <span className="text-sm font-black text-gray-700">{type.score}/8</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${type.color} transition-all`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="block w-full rounded-3xl bg-gradient-to-r from-violet-500 to-pink-500 py-4 text-center font-bold text-white shadow-lg shadow-purple-200 transition hover:opacity-90"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </main>
  );
}
