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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 p-10">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-600 shadow-lg">
          Test topilmadi
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)" }}>
      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-yellow-300 opacity-20 blur-3xl" />
        <div className="absolute bottom-10 -left-20 h-72 w-72 rounded-full bg-blue-400 opacity-20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Top gradient banner */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-8 py-8 text-white">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🧠</span>
                <div>
                  <p className="text-sm font-medium text-white/70">Psixologik test</p>
                  <h1 className="text-2xl font-black">{test.title_uz}</h1>
                </div>
              </div>
              {count && (
                <div className="mt-4 flex gap-4">
                  <div className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    📝 {count} ta savol
                  </div>
                  <div className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    ⏱ ~{Math.ceil(count / 3)} daqiqa
                  </div>
                </div>
              )}
            </div>

            <div className="p-8">
              {test.description_uz && (
                <p className="rounded-2xl bg-purple-50 px-5 py-4 text-sm leading-relaxed text-gray-600">
                  {test.description_uz}
                </p>
              )}

              <form action={startTest} className="mt-6 space-y-4">
                <input type="hidden" name="test_id" value={test.id} />

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    👤 F.I.Sh.
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    placeholder="Ism familiyangizni kiriting"
                    required
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    🏫 Sinf
                  </label>
                  <input
                    type="text"
                    name="class_name"
                    placeholder="Masalan: 9-A"
                    required
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    🌐 Til
                  </label>
                  <select
                    name="language"
                    defaultValue="uz"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
                  >
                    <option value="uz">🇺🇿 O&apos;zbek</option>
                    <option value="ru">🇷🇺 Русский</option>
                    <option value="kaa">🏳️ Qaraqalpaqsha</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 py-4 font-bold text-white shadow-lg shadow-purple-200 transition hover:shadow-purple-300 hover:opacity-90 active:scale-95"
                >
                  Testni boshlash 🚀
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            ← <a href="/" className="underline underline-offset-2 hover:text-white">Testlar ro&apos;yxatiga qaytish</a>
          </p>
        </div>
      </div>
    </main>
  );
}
