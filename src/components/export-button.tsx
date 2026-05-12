"use client";

import ExcelJS from "exceljs";

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
  async function handleExport() {
    const rows = submissions.map((item) => {
      const testTitle = Array.isArray(item.tests)
        ? item.tests[0]?.title_uz
        : item.tests?.title_uz;
      return {
        student: item.student_name || "-",
        class: item.class_name || "-",
        lang: item.language?.toUpperCase() || "-",
        test: testTitle || "-",
        score: item.total_score ?? 0,
        status: item.status || "-",
        date: item.created_at
          ? new Date(item.created_at).toLocaleString("uz-UZ")
          : "-",
      };
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Natijalar");

    ws.columns = [
      { header: "O'quvchi", key: "student", width: 24 },
      { header: "Sinf",     key: "class",   width: 10 },
      { header: "Til",      key: "lang",    width: 6  },
      { header: "Test",     key: "test",    width: 28 },
      { header: "Ball",     key: "score",   width: 8  },
      { header: "Holat",    key: "status",  width: 14 },
      { header: "Sana",     key: "date",    width: 20 },
    ];

    ws.getRow(1).font = { bold: true };
    rows.forEach((r) => ws.addRow(r));

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `natijalar_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
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
