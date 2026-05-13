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
        <div className="border-2 border-red-500 bg-red-50 p-8 font-bold uppercase text-red-700">
          Test topilmadi
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Top nav strip */}
      <div className="border-b-2 border-zinc-900 bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white transition hover:text-yellow-400">
            <span>←</span> Testlar ro&apos;yxati
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center bg-yellow-400 text-zinc-900">
              <span className="text-sm font-black">Ψ</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white">PsyTest</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Sariq accent strip yuqorida */}
        <div className="h-1 w-full bg-yellow-400" />

        <div className="mx-auto grid max-w-5xl gap-0 px-6 py-12 lg:grid-cols-5 lg:gap-12">
          {/* CHAP — info */}
          <div className="lg:col-span-2 lg:py-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-zinc-900" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900">
                / Psixologik test
              </span>
            </div>

            <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight text-zinc-900">
              {test.title_uz}
            </h1>

            {test.description_uz && (
              <p className="mt-6 text-base leading-relaxed text-zinc-600">
                {test.description_uz}
              </p>
            )}

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-0 border-2 border-zinc-900">
              <div className="border-r-2 border-zinc-900 p-5">
                <p className="text-4xl font-black tabular-nums text-zinc-900">
                  {String(count ?? 0).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  ta savol
                </p>
              </div>
              <div className="p-5">
                <p className="text-4xl font-black tabular-nums text-zinc-900">
                  ~{Math.ceil((count ?? 0) / 3)}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  daqiqa
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 space-y-2">
              {["Anonim javoblar", "Bepul ishtirok", "3 tilda mavjud"].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center bg-yellow-400 text-zinc-900">
                    <span className="text-xs font-black">✓</span>
                  </span>
                  <span className="font-bold text-zinc-700">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* O'NG — form card */}
          <div className="mt-8 lg:col-span-3 lg:mt-0">
            <div className="border-2 border-zinc-900 bg-white">
              {/* Card header */}
              <div className="flex items-center justify-between border-b-2 border-zinc-900 bg-zinc-900 px-6 py-4 text-white">
                <span className="text-xs font-black uppercase tracking-widest">
                  / Boshlash uchun ma&apos;lumot
                </span>
                <span className="h-2 w-2 bg-yellow-400" />
              </div>

              <form action={startTest} className="space-y-6 p-8">
                <input type="hidden" name="test_id" value={test.id} />

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-zinc-900">
                    01 / Ism familiya
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    placeholder="Masalan: Ali Valiyev"
                    required
                    className="w-full border-2 border-zinc-300 bg-white px-4 py-3.5 font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-zinc-900">
                    02 / Sinf
                  </label>
                  <input
                    type="text"
                    name="class_name"
                    placeholder="Masalan: 9-A"
                    required
                    className="w-full border-2 border-zinc-300 bg-white px-4 py-3.5 font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-zinc-900">
                    03 / Til
                  </label>
                  <select
                    name="language"
                    defaultValue="uz"
                    className="w-full border-2 border-zinc-300 bg-white px-4 py-3.5 font-medium text-zinc-900 outline-none transition focus:border-blue-600"
                  >
                    <option value="uz">🇺🇿 O&apos;zbek tili</option>
                    <option value="ru">🇷🇺 Русский язык</option>
                    <option value="kaa">🏳️ Qaraqalpaq tili</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-3 border-2 border-zinc-900 bg-yellow-400 py-4 text-sm font-black uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-900 hover:text-yellow-400"
                >
                  Testni boshlash
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </form>
            </div>

            <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
              ✦ Javoblaringiz xavfsiz saqlanadi
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
