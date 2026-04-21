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
  answers?: {
    auto_score: number | null;
    final_score: number | null;
    questions: { question_order: number | null } | null;
  }[] | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  submitted: { label: "Yuborildi", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  pending_review: { label: "Kutilmoqda", color: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
  checked: { label: "Tekshirildi", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
};

export default async function AdminResultsPage() {
  const supabase = createSupabaseServerClient();

  const { data: submissions, error } = await supabase
    .from("submissions")
    .select(`id, student_name, class_name, language, auto_score, total_score, status, created_at,
      tests ( title_uz ),
      answers ( auto_score, final_score, questions ( question_order ) )`)
    .order("created_at", { ascending: false });

  const total = submissions?.length ?? 0;
  const checked = submissions?.filter((s) => s.status === "checked").length ?? 0;
  const pending = submissions?.filter((s) => s.status === "pending_review").length ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Top bar */}
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
            {submissions && submissions.length > 0 && <ExportButton submissions={submissions} />}
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

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Xatolik: {error.message}
          </div>
        )}

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {["O'quvchi", "Sinf", "Til", "Test", "Ball", "Holat", "Sana", ""].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions && submissions.length > 0 ? (
                  submissions.map((item: SubmissionItem) => {
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
                    <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                      <div className="text-4xl">📭</div>
                      <p className="mt-2">Hozircha natijalar yo'q</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
