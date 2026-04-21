import Link from "next/link";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

type ResultPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submission?: string }>;
};

export default async function ResultPage({ params, searchParams }: ResultPageProps) {
  const { id } = await params;
  const { submission } = await searchParams;
  const supabase = createSupabaseServerClient();

  const { data: sub } = await supabase
    .from("submissions")
    .select("student_name, language")
    .eq("id", submission ?? "")
    .single();

  const lang = sub?.language ?? "uz";

  const messages = {
    uz: {
      title: "Javobingiz qabul qilindi!",
      desc: "Test muvaffaqiyatli topshirildi. Natijangiz psixolog tomonidan ko'rib chiqiladi.",
      back: "Bosh sahifaga qaytish",
    },
    ru: {
      title: "Ваши ответы приняты!",
      desc: "Тест успешно пройден. Ваши результаты будут рассмотрены психологом.",
      back: "На главную",
    },
    kaa: {
      title: "Jawaplarıńız qabıl etildi!",
      desc: "Test wáde jetkerildi. Nátiyjeleríńiz psixolog tárepinen qarap shıǵıladı.",
      back: "Bas betke qaytıw",
    },
  };

  const m = messages[lang as keyof typeof messages] ?? messages.uz;

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-yellow-300 opacity-20 blur-3xl" />
        <div className="absolute bottom-10 -left-20 h-72 w-72 rounded-full bg-blue-400 opacity-20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-8 py-10">
              <div className="text-6xl">✅</div>
              <h1 className="mt-4 text-2xl font-black text-white">{m.title}</h1>
            </div>

            <div className="p-8">
              {sub?.student_name && (
                <p className="text-lg font-semibold text-gray-800">{sub.student_name}</p>
              )}
              <p className="mt-3 leading-relaxed text-gray-500">{m.desc}</p>

              <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-sm text-gray-400 flex items-center gap-3">
                <span className="text-2xl">🕐</span>
                <span>
                  {lang === "ru"
                    ? "Результаты будут доступны после проверки"
                    : lang === "kaa"
                    ? "Nátiyjeler tekseriwden keyin belgili boladı"
                    : "Natijalar tekshirilgandan so'ng ma'lum bo'ladi"}
                </span>
              </div>

              <Link
                href="/"
                className="mt-6 block w-full rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 py-4 font-bold text-white shadow-lg transition hover:opacity-90"
              >
                ← {m.back}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
