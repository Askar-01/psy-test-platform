export const dynamic = "force-dynamic";
import Link from "next/link";
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
      <main className="flex min-h-screen items-center justify-center bg-white p-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          Test topilmadi
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Dekorativ shakllar */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-indigo-100 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 -right-20 h-72 w-72 rounded-full bg-pink-100 opacity-40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-10">
        <div className="w-full">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-indigo-600"
          >
            <span>←</span> Testlar
          </Link>

          {/* Card */}
          <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-100">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Psixologik test
              </span>
              {count && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  {count} ta savol · ~{Math.ceil(count / 3)} daqiqa
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-zinc-900">
              {test.title_uz}
            </h1>

            {test.description_uz && (
              <p className="mt-4 text-base leading-relaxed text-zinc-500">
                {test.description_uz}
              </p>
            )}

            {/* Form */}
            <form action={startTest} className="mt-10 space-y-5">
              <input type="hidden" name="test_id" value={test.id} />

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Ism familiya
                </label>
                <input
                  type="text"
                  name="student_name"
                  placeholder="Masalan: Ali Valiyev"
                  required
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Sinf
                </label>
                <input
                  type="text"
                  name="class_name"
                  placeholder="Masalan: 9-A"
                  required
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Til
                </label>
                <select
                  name="language"
                  defaultValue="uz"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-zinc-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="uz">🇺🇿 O&apos;zbek tili</option>
                  <option value="ru">🇷🇺 Русский язык</option>
                  <option value="kaa">🏳️ Qaraqalpaq tili</option>
                </select>
              </div>

              <button
                type="submit"
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-4 font-semibold text-white transition hover:bg-indigo-600 active:scale-[0.98]"
              >
                Testni boshlash
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-400">
            Javoblaringiz anonim saqlanadi
          </p>
        </div>
      </div>
    </main>
  );
}
