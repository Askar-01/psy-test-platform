import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { startTest } from "./actions";

type TestPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TestDetailPage({ params }: TestPageProps) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data: test, error } = await supabase
    .from("tests")
    .select("id, title_uz, description_uz")
    .eq("id", id)
    .single();

  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("test_id", id);

  if (error || !test) {
    return (
      <main className="flex min-h-screen items-center justify-center p-10" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #1a1a6e 100%)" }}>
        <div className="rounded-3xl p-8 text-red-400" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,100,100,0.3)" }}>
          Test topilmadi
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #1a1a6e 40%, #2d1b8e 70%, #1e0a5c 100%)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 h-1 w-1 rounded-full bg-white opacity-50" />
        <div className="absolute top-40 right-32 h-1.5 w-1.5 rounded-full bg-white opacity-40" />
        <div className="absolute bottom-20 left-40 h-1 w-1 rounded-full bg-white opacity-60" />
        <div className="absolute top-1/2 right-20 h-2 w-2 rounded-full bg-white opacity-30" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="overflow-hidden rounded-3xl shadow-2xl" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {/* Top banner */}
            <div className="px-8 py-8" style={{ background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: "rgba(255,255,255,0.15)" }}>
                  🧠
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Psixologik test</p>
                  <h1 className="text-2xl font-black text-white">{test.title_uz}</h1>
                </div>
              </div>
              {count && (
                <div className="mt-4 flex gap-3">
                  <div className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "rgba(255,255,255,0.12)" }}>
                    📝 {count} ta savol
                  </div>
                  <div className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "rgba(255,255,255,0.12)" }}>
                    ⏱ ~{Math.ceil(count / 3)} daqiqa
                  </div>
                </div>
              )}
            </div>

            <div className="p-8">
              {test.description_uz && (
                <p className="rounded-2xl px-5 py-4 text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                  {test.description_uz}
                </p>
              )}

              <form action={startTest} className="mt-6 space-y-4">
                <input type="hidden" name="test_id" value={test.id} />

                <div>
                  <label className="mb-2 block text-sm font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                    👤 F.I.Sh.
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    placeholder="Ism familiyangizni kiriting"
                    required
                    className="w-full rounded-2xl px-5 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:ring-2 focus:ring-white/20"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                    🏫 Sinf
                  </label>
                  <input
                    type="text"
                    name="class_name"
                    placeholder="Masalan: 9-A"
                    required
                    className="w-full rounded-2xl px-5 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:ring-2 focus:ring-white/20"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                    🌐 Til
                  </label>
                  <select
                    name="language"
                    defaultValue="uz"
                    className="w-full rounded-2xl px-5 py-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-white/20"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    <option value="uz" style={{ background: "#1a1a6e" }}>🇺🇿 O&apos;zbek</option>
                    <option value="ru" style={{ background: "#1a1a6e" }}>🇷🇺 Русский</option>
                    <option value="kaa" style={{ background: "#1a1a6e" }}>🏳️ Qaraqalpaqsha</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-2xl py-4 font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #4040cc, #7020aa)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  Testni boshlash 🚀
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            ← <a href="/" className="underline underline-offset-2 hover:text-white transition">Testlar ro&apos;yxatiga qaytish</a>
          </p>
        </div>
      </div>
    </main>
  );
}
