export const dynamic = "force-dynamic";

import Link from "next/link";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import LogoutButton from "../../../components/logout-button";
import ExportButton from "../../../components/export-button";

type SubmissionItem = {
  id: string;
  student_name: string | null;
  class_name: string | null;
  language: string | null;
  auto_score: number | null;
  total_score: number | null;
  status: string | null;
  created_at: string | null;
  tests: { title_uz: string | null } | { title_uz: string | null }[] | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  submitted: { label: "Yuborildi", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  pending_review: { label: "Kutilmoqda", color: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
  checked: { label: "Tekshirildi", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
};

const PAGE_SIZE = 20;

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; class?: string }>;
}) {
  const { page, class: classFilter } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createSupabaseServerClient();

  // Barcha sinflarni olish (filter uchun)
  const { data: allClasses } = await supabase
    .from("submissions")
    .select("class_name")
    .not("class_name", "is", null)
    .order("class_name");

  const uniqueClasses = [...new Set(allClasses?.map((s) => s.class_name).filter(Boolean) ?? [])].sort();

  // Asosiy query (filter bilan)
  let query = supabase
    .from("submissions")
    .select(`id, student_name, class_name, language, auto_score, total_score, status, created_at, tests ( title_uz )`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (classFilter) query = query.eq("class_name", classFilter);

  const { data: submissions, error, count } = await query;

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Export uchun barcha submissions (filter bilan)
  let exportQuery = supabase
    .from("submissions")
    .select(`id, student_name, class_name, language, auto_score, total_score, status, created_at, tests ( title_uz )`)
    .order("created_at", { ascending: false });

  if (classFilter) exportQuery = exportQuery.eq("class_name", classFilter);
  const { data: allSubmissions } = await exportQuery;

  // Statistika
  const { data: statsData } = await supabase
    .from("submissions")
    .select("status")
    .then((res) => res);

  const checked = statsData?.filter((s) => s.status === "checked").length ?? 0;
  const pending = statsData?.filter((s) => s.status === "pending_review").length ?? 0;
  const total = statsData?.length ?? 0;

  function getPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  function buildUrl(p: number, c?: string) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (c) params.set("class", c);
    return `/admin/results?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-lg shadow-md">
              🧠
            </div>
            <div>
              <p className="text-xs text-gray-400">Admin panel</p>
              <h1 className="text-lg font-black text-gray-900">Natijalar</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {allSubmissions && allSubmissions.length > 0 && <ExportButton submissions={allSubmissions} />}
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Jami", value: total, icon: "📋", color: "from-violet-500 to-purple-600" },
            { label: "Kutilmoqda", value: pending, icon: "⏳", color: "from-amber-400 to-orange-500" },
            { label: "Tekshirildi", value: checked, icon: "✅", color: "from-emerald-400 to-teal-500" },
          ].map((stat) => (
            <div key={stat.label} className="overflow-hidden rounded-3xl bg-white shadow-md">
              <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />
              <div className="flex items-center gap-4 p-5">
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sinf filtri */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Sinf:</span>
          <Link
            href="/admin/results?page=1"
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
              !classFilter
                ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md"
                : "bg-white text-gray-600 shadow-sm hover:bg-purple-50 hover:text-purple-600"
            }`}
          >
            Barchasi
          </Link>
          {uniqueClasses.map((cls) => (
            <Link
              key={cls}
              href={buildUrl(1, cls ?? undefined)}
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
                classFilter === cls
                  ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md"
                  : "bg-white text-gray-600 shadow-sm hover:bg-purple-50 hover:text-purple-600"
              }`}
            >
              {cls}
            </Link>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Xatolik: {error.message}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {["#", "O'quvchi", "Sinf", "Til", "Test", "Ball", "Holat", "Sana", ""].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions && submissions.length > 0 ? (
                  submissions.map((item: SubmissionItem, index: number) => {
                    const testTitle = Array.isArray(item.tests)
                      ? item.tests[0]?.title_uz
                      : item.tests?.title_uz;
                    const statusCfg = STATUS_CONFIG[item.status ?? ""] ?? {
                      label: item.status ?? "-",
                      color: "bg-gray-100 text-gray-600",
                      dot: "bg-gray-400",
                    };

                    return (
                      <tr key={item.id} className="group transition hover:bg-purple-50/50">
                        <td className="px-5 py-4 text-xs text-gray-400">{from + index + 1}</td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-900">{item.student_name || "—"}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{item.class_name || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold uppercase text-gray-600">
                            {item.language || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{testTitle || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="text-lg font-black text-gray-900">{item.total_score ?? 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString("uz-UZ", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/results/${item.id}`}
                            className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-xs font-bold text-white opacity-0 shadow-md transition group-hover:opacity-100"
                          >
                            Ko'rish →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center text-gray-400">
                      <div className="text-4xl">📭</div>
                      <p className="mt-2">
                        {classFilter ? `${classFilter} sinfi uchun natijalar yo'q` : "Hozircha natijalar yo'q"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-400">
                Jami <span className="font-bold text-gray-700">{totalCount}</span> ta •{" "}
                {from + 1}–{Math.min(to + 1, totalCount)} ko'rsatilmoqda
              </p>
              <div className="flex items-center gap-1">
                <Link
                  href={buildUrl(currentPage - 1, classFilter)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    currentPage === 1
                      ? "pointer-events-none text-gray-300"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  ←
                </Link>
                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={buildUrl(p as number, classFilter)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                        p === currentPage
                          ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
                <Link
                  href={buildUrl(currentPage + 1, classFilter)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    currentPage === totalPages
                      ? "pointer-events-none text-gray-300"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
