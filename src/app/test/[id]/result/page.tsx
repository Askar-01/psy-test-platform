import Link from "next/link";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import {
  verifySubmissionToken,
  SUBMISSION_COOKIE_NAME,
} from "../../../../lib/submission-session";

type ResultPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submission?: string }>;
};

const DENIED_MESSAGES: Record<string, { title: string; desc: string; back: string }> = {
  uz: {
    title: "Ruxsat yo'q",
    desc: "Bu natijaga kirish ruxsatingiz yo'q. Test natijalarini faqat testni topshirgan o'quvchining o'zi (o'sha brauzerda) ko'ra oladi.",
    back: "Bosh sahifaga qaytish",
  },
  ru: {
    title: "Доступ запрещен",
    desc: "У вас нет доступа к этому результату. Результаты теста может видеть только тот, кто его прошёл (в том же браузере).",
    back: "На главную",
  },
  kaa: {
    title: "Ruxsat joq",
    desc: "Bul nátiyjege kiriw ruxsatıńız joq. Test nátiyjelerin tek testti tapsırǵan oqıwshınıń ózi kórip aladı.",
    back: "Bas betke qaytıw",
  },
};

function DeniedView({ lang }: { lang: string }) {
  const m = DENIED_MESSAGES[lang as keyof typeof DENIED_MESSAGES] ?? DENIED_MESSAGES.uz;
  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)" }}>
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="overflow-hidden rounded-3xl shadow-2xl" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,100,100,0.3)" }}>
            <div className="px-8 py-10" style={{ background: "rgba(255,80,80,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl text-5xl" style={{ background: "rgba(255,80,80,0.2)", border: "1px solid rgba(255,80,80,0.4)" }}>
                🔒
              </div>
              <h1 className="mt-4 text-2xl font-black text-white">{m.title}</h1>
            </div>
            <div className="p-8">
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{m.desc}</p>
              <Link
                href="/"
                className="mt-6 block w-full rounded-2xl py-4 font-bold text-white shadow-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "1px solid rgba(255,255,255,0.2)" }}
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

export default async function ResultPage({ params, searchParams }: ResultPageProps) {
  await params; // id ishlatilmaydi, lekin Next.js Promise'ni resolve qilishni talab qiladi
  const { submission } = await searchParams;

  // Submission token tekshiruvi
  const cookieStore = await cookies();
  const subToken = cookieStore.get(SUBMISSION_COOKIE_NAME)?.value;
  const tokenOk = await verifySubmissionToken(submission, subToken);
  if (!tokenOk) {
    return <DeniedView lang="uz" />;
  }

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
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 h-1 w-1 rounded-full bg-white opacity-50" />
        <div className="absolute top-40 right-32 h-1.5 w-1.5 rounded-full bg-white opacity-40" />
        <div className="absolute bottom-20 left-40 h-1 w-1 rounded-full bg-white opacity-60" />
        <div className="absolute top-1/2 right-20 h-2 w-2 rounded-full bg-white opacity-30" />
        <div className="absolute bottom-40 right-60 h-1 w-1 rounded-full bg-white opacity-50" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="overflow-hidden rounded-3xl shadow-2xl" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="px-8 py-10" style={{ background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl text-5xl" style={{ background: "rgba(80,200,120,0.2)", border: "1px solid rgba(80,200,120,0.4)" }}>
                ✅
              </div>
              <h1 className="mt-4 text-2xl font-black text-white">{m.title}</h1>
            </div>

            <div className="p-8">
              {sub?.student_name && (
                <p className="text-lg font-semibold text-white">{sub.student_name}</p>
              )}
              <p className="mt-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{m.desc}</p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl p-5 text-sm" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
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
                className="mt-6 block w-full rounded-2xl py-4 font-bold text-white shadow-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "1px solid rgba(255,255,255,0.2)" }}
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
