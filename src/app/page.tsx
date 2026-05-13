export const dynamic = "force-dynamic";
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
    <main className="min-h-screen bg-white">
      {/* Dekorativ shakllar */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-indigo-100 opacity-60 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-pink-100 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-amber-100 opacity-40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Psixologik testlar platformasi
          </div>
          <h1 className="mt-6 text-6xl font-black tracking-tight text-zinc-900 sm:text-7xl">
            O&apos;zingizni
            <br />
            <span className="text-indigo-600">kashf eting.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-500">
            Quyidagi testlardan birini tanlang va o&apos;zingiz haqingizda yangi narsalarni biling.
            Hammasi anonim, natijalar faqat siz uchun.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Xatolik: {error.message}
          </div>
        )}

        {/* Testlar grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {tests && tests.length > 0 ? (
            tests.map((test: TestItem, i) => (
              <Link key={test.id} href={`/test/${test.id}`} className="group">
                <article className="relative h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-7 transition-all duration-300 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-bold text-zinc-300 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-700">
                      Test
                    </span>
                  </div>

                  <h2 className="mt-8 text-2xl font-bold tracking-tight text-zinc-900 transition group-hover:text-indigo-600">
                    {test.title_uz || "Nomsiz test"}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                    {test.description_uz || "Bu test haqida tavsif yo'q"}
                  </p>

                  <div className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                    Boshlash
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>

                  <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-indigo-500 opacity-0 blur-2xl transition group-hover:opacity-10" />
                </article>
              </Link>
            ))
          ) : (
            <div className="col-span-2 rounded-3xl border border-dashed border-zinc-300 p-16 text-center">
              <p className="text-zinc-400">Hozircha testlar yo&apos;q</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-20 flex items-center justify-between border-t border-zinc-100 pt-8">
          <p className="text-xs text-zinc-400">
            Anonim · Bepul · Natijalar faqat o&apos;zingiz uchun
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Tizim ishlamoqda
          </div>
        </div>
      </div>
    </main>
  );
}
