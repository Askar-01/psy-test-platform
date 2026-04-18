import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase-server";

type TestItem = {
  id: string;
  title_uz: string | null;
  description_uz: string | null;
};

const CARD_COLORS = [
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", num: "text-violet-300" },
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", num: "text-rose-300" },
  { bg: "from-amber-500 to-orange-500", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", num: "text-amber-300" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", num: "text-emerald-300" },
  { bg: "from-sky-500 to-blue-600", light: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", num: "text-sky-300" },
];

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const { data: tests, error } = await supabase
    .from("tests")
    .select("id, title_uz, description_uz")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)" }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-yellow-300 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-pink-400 opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 h-72 w-72 rounded-full bg-blue-400 opacity-20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm">
            🧠 Psixologik testlar platformasi
          </div>
          <h1 className="mt-6 text-5xl font-black text-white drop-shadow-lg">
            O&apos;zingizni kashf eting
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Quyidagi testlardan birini tanlang va o&apos;zingiz haqingizda ko&apos;proq bilib oling
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Xatolik: {error.message}
          </div>
        )}

        {/* Test cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {tests && tests.length > 0 ? (
            tests.map((test: TestItem, i) => {
              const color = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <Link key={test.id} href={`/test/${test.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    {/* Colored top bar */}
                    <div className={`h-2 w-full bg-gradient-to-r ${color.bg}`} />

                    <div className="p-7">
                      <div className={`inline-flex items-center gap-2 rounded-xl ${color.light} ${color.border} border px-3 py-1.5 text-xs font-semibold ${color.text}`}>
                        📋 Test #{i + 1}
                      </div>

                      <h2 className="mt-4 text-xl font-bold text-gray-900 group-hover:text-gray-700">
                        {test.title_uz || "Nomsiz test"}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {test.description_uz || "Tavsif yo'q"}
                      </p>

                      <div className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${color.bg} px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all group-hover:shadow-lg`}>
                        Testni boshlash →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-2 rounded-3xl bg-white/80 p-10 text-center text-gray-500 backdrop-blur-sm">
              Hozircha testlar yo&apos;q
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-sm text-white/50">
          Barcha testlar anonim • Natijalar faqat o&apos;zingiz uchun
        </p>
      </div>
    </main>
  );
}
