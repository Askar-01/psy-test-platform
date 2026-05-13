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
      {/* HERO Section — qora fon */}
      <section className="relative overflow-hidden bg-zinc-900 text-white">
        {/* Sariq dekoratsiya */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-yellow-400 opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-600 opacity-30 blur-3xl" />

        {/* Diagonal lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 20px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          {/* Top bar */}
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-yellow-400 text-zinc-900">
                <span className="text-xl font-black">Ψ</span>
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">
                PsyTest
              </span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 bg-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Online · {tests?.length ?? 0} ta test
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 border-2 border-yellow-400 bg-yellow-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-yellow-400">
              <span className="h-1.5 w-1.5 bg-yellow-400" />
              Psixologik testlar platformasi
            </div>

            <h1 className="mt-8 text-6xl font-black uppercase leading-[0.95] tracking-tight sm:text-8xl">
              O&apos;zingizni
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-yellow-400">kashf</span>
                <span className="absolute inset-x-0 bottom-2 z-0 h-4 bg-blue-600" />
              </span>
              <br />
              eting.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Quyidagi testlardan birini tanlang. Aniq, ishonarli va to&apos;liq anonim.
              Natijalar — faqat siz uchun.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="#testlar"
                className="group inline-flex items-center gap-3 bg-yellow-400 px-8 py-4 text-sm font-black uppercase tracking-widest text-zinc-900 transition hover:bg-white"
              >
                Testlarni ko&apos;rish
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <span className="h-2 w-2 animate-pulse bg-emerald-400" />
                Tizim ishlamoqda
              </div>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="relative border-t-2 border-yellow-400 bg-blue-600">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white">
            <span>✦ Anonim</span>
            <span>✦ Bepul</span>
            <span>✦ 3 tilda</span>
            <span>✦ Mobil mos</span>
            <span>✦ Tez natija</span>
          </div>
        </div>
      </section>

      {/* TESTLAR Section */}
      <section id="testlar" className="relative bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <div className="mb-16 flex items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-zinc-900" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  / Testlar
                </span>
              </div>
              <h2 className="mt-4 text-5xl font-black uppercase tracking-tight text-zinc-900 sm:text-6xl">
                Mavjud
                <span className="text-blue-600"> testlar</span>
              </h2>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-5xl font-black tabular-nums text-zinc-900">
                {String(tests?.length ?? 0).padStart(2, "0")}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
                jami test
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-8 border-2 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700">
              Xatolik: {error.message}
            </div>
          )}

          {/* Testlar grid */}
          <div className="grid gap-0 border-t-2 border-zinc-900 sm:grid-cols-2">
            {tests && tests.length > 0 ? (
              tests.map((test: TestItem, i) => (
                <Link
                  key={test.id}
                  href={`/test/${test.id}`}
                  className="group relative block border-b-2 border-zinc-900 p-8 transition hover:bg-zinc-900 sm:border-r-2 sm:[&:nth-child(2n)]:border-r-0"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-black tabular-nums text-zinc-300 group-hover:text-yellow-400">
                      {String(i + 1).padStart(2, "0")} /
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center bg-zinc-900 text-yellow-400 transition group-hover:bg-yellow-400 group-hover:text-zinc-900">
                      →
                    </span>
                  </div>

                  <h3 className="mt-12 text-2xl font-black uppercase leading-tight tracking-tight text-zinc-900 transition group-hover:text-white sm:text-3xl">
                    {test.title_uz || "Nomsiz test"}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-500 transition group-hover:text-zinc-300">
                    {test.description_uz || "Tavsif yo'q"}
                  </p>

                  <div className="mt-8 inline-flex items-center gap-2 border-b-2 border-zinc-900 pb-1 text-xs font-black uppercase tracking-widest text-zinc-900 transition group-hover:border-yellow-400 group-hover:text-yellow-400">
                    Boshlash
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 border-b-2 border-zinc-900 p-16 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                  Hozircha testlar yo&apos;q
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA / FOOTER */}
      <section className="relative bg-blue-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
                Tayyormisiz?
              </h3>
              <p className="mt-2 text-sm font-bold uppercase tracking-widest text-blue-200">
                Testni hoziroq boshlash mumkin
              </p>
            </div>
            <a
              href="#testlar"
              className="group inline-flex items-center gap-3 bg-yellow-400 px-8 py-4 text-sm font-black uppercase tracking-widest text-zinc-900 transition hover:bg-white"
            >
              Boshladim
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        <div className="mt-16 border-t border-blue-500/50 pt-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-xs font-bold uppercase tracking-widest text-blue-200">
            <span>© PsyTest · {new Date().getFullYear()}</span>
            <span>Anonim · Bepul · Xavfsiz</span>
          </div>
        </div>
      </section>
    </main>
  );
}
