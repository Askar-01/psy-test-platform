"use client";

import * as XLSX from "xlsx";

type SubmissionItem = {
  id: string;
  student_name: string | null;
  class_name: string | null;
  language: string | null;
  auto_score: number | null;
  total_score: number | null;
  status: string | null;
  created_at: string | null;
  tests:
    | { title_uz: string | null }
    | { title_uz: string | null }[]
    | null;
};

type ExportButtonProps = {
  submissions: SubmissionItem[];
};

export default function ExportButton({ submissions }: ExportButtonProps) {
  function handleExport() {
    const rows = submissions.map((item) => {
      const testTitle = Array.isArray(item.tests)
        ? item.tests[0]?.title_uz
        : item.tests?.title_uz;

      return {
        "O'quvchi": item.student_name || "-",
        Sinf: item.class_name || "-",
        Til: item.language?.toUpperCase() || "-",
        Test: testTitle || "-",
        Ball: item.total_score ?? 0,
        Holat: item.status || "-",
        Sana: item.created_at
          ? new Date(item.created_at).toLocaleString("uz-UZ")
          : "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Natijalar");

    // Ustun kengliklarini avtomatik sozlash
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length)
      ) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `natijalar_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
    >
      Excel yuklab olish
    </button>
  );
}
