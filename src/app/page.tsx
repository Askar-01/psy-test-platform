import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase-server";

type TestItem = {
  id: string;
  title_uz: string | null;
  description_uz: string | null;
};

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const { data: tests, error } = await supabase
    .from("tests")
    .select("id, title_uz, description_uz")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #1a1a6e 40%, #2d1b8e 70%, #1e0a5c 100%)" }}>
      {/* Stars decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 h-1 w-1 rounded-full bg-white opacity-60" />
        <div className="absolute top-32 left-60 h-1.5 w-1.5 rounded-full bg-white opacity-40" />
        <div className="absolute top-20 right-40 h-1 w-1 rounded-full bg-white opacity-70" />
        <div className="absolute top-60 right-20 h-2 w-2 rounded-full bg-white opacity-30" />
        <div className="absolute top-80 left-40 h-1 w-1 rounded-full bg-white opacity-50" />
        <div className="absolute bottom-40 left-80 h-1.5 w-1.5 rounded-full bg-white opacity-40" />
        <div className="absolute bottom-60 right-60 h-1 w-1 rounded-full bg-white opacity-60" />
        <div className="absolute -top-20 left-1/2 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "#4040ff" }} />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: "#8000ff" }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-16">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <span className="text-4xl">🧠</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white/70" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            Psixologik testlar platformasi
          </div>
          <h1 className="mt-5 text-5xl font-black text-white">
            O&apos;zingizni kashf eting
          </h1>
          <p className="mt-4 text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            Quyidagi testlardan birini tanlang va o&apos;zingiz haqingizda ko&apos;proq bilib oling
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-400 bg-red-900/30 p-4 text-red-300">
            Xatolik: {error.message}
          </div>
        )}

        {/* Test cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {tests && tests.length > 0 ? (
            tests.map((test: TestItem, i) => (
              <Link key={test.id} href={`/test/${test.id}`} className="group block">
                <div
                  className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="rounded-2xl px-3 py-1.5 text-xs font-bold"
                      style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
                    >
                      📋 Test #{i + 1}
                    </div>
                    <div
                      className="rounded-xl px-3 py-1 text-xs font-medium opacity-0 transition group-hover:opacity-100"
                      style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                    >
                      Boshlash →
                    </div>
                  </div>

                  <h2 className="mt-4 text-xl font-black text-white">
                    {test.title_uz || "Nomsiz test"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {test.description_uz || "Tavsif yo'q"}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition group-hover:opacity-90" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    Testni boshlash →
                  </div>

                  {/* Glow effect */}
                  <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full opacity-0 blur-3xl transition group-hover:opacity-20" style={{ background: "#7070ff" }} />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 rounded-3xl p-10 text-center" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
              Hozircha testlar yo&apos;q
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Barcha testlar anonim • Natijalar faqat o&apos;zingiz uchun
        </p>
      </div>
    </main>
  );
}
