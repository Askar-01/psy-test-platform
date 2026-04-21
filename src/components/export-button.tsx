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
  answers?: {
    auto_score: number | null;
    final_score: number | null;
    questions?: {
      question_order: number | null;
    } | null;
  }[];
  thinking_scores?: {
    predmetli: number;
    abstrakt: number;
    soz: number;
    korganmali: number;
    kreativ: number;
  } | null;
};

type ExportButtonProps = {
  submissions: SubmissionItem[];
};

// Fikrlash turi ballari: savol raqamlari asosida hisoblash
// 1,6,11,16,21,26,31,36 → Predmetli-amaliy
// 2,7,12,17,22,27,32,37 → Abstrakt-simvolik
// 3,8,13,18,23,28,33,38 → So'z-mantiqiy
// 4,9,14,19,24,29,34,39 → Ko'rgazmali-obrazli
// 5,10,15,20,25,30,35,40 → Kreativlik
function getThinkingScores(answers: SubmissionItem["answers"]) {
  const scores = { predmetli: 0, abstrakt: 0, soz: 0, korganmali: 0, kreativ: 0 };
  if (!answers) return scores;

  answers.forEach((ans) => {
    const order = ans.questions?.question_order;
    if (!order) return;
    const ball = ans.final_score ?? ans.auto_score ?? 0;
    const col = order % 5;
    if (col === 1) scores.predmetli += ball;
    else if (col === 2) scores.abstrakt += ball;
    else if (col === 3) scores.soz += ball;
    else if (col === 4) scores.korganmali += ball;
    else if (col === 0) scores.kreativ += ball;
  });

  return scores;
}

export default function ExportButton({ submissions }: ExportButtonProps) {
  function handleExport() {
    const rows = submissions.map((item) => {
      const testTitle = Array.isArray(item.tests)
        ? item.tests[0]?.title_uz
        : item.tests?.title_uz;

      const ts = item.thinking_scores ?? getThinkingScores(item.answers);

      return {
        "O'quvchi": item.student_name || "-",
        Sinf: item.class_name || "-",
        Til: item.language?.toUpperCase() || "-",
        Test: testTitle || "-",
        "Predmetli-amaliy": ts.predmetli,
        "Abstrakt-simvolik": ts.abstrakt,
        "So'z-mantiqiy": ts.soz,
        "Ko'rgazmali-obrazli": ts.korganmali,
        Kreativlik: ts.kreativ,
        "Umumiy ball": item.total_score ?? 0,
        Holat: item.status || "-",
        Sana: item.created_at
          ? new Date(item.created_at).toLocaleString("uz-UZ")
          : "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Natijalar");

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