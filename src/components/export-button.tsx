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

// Excel sheet nomi uchun ruxsat etilmagan belgilarni olib tashlash + 31 belgi cheklov
function sanitizeSheetName(name: string, fallback: string): string {
  if (!name) return fallback;
  let cleaned = name.replace(/[\\/\?\*\[\]:]/g, " ").trim();
  if (!cleaned) cleaned = fallback;
  if (cleaned.length > 31) cleaned = cleaned.slice(0, 28) + "...";
  return cleaned;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Yuborildi",
  pending_review: "Kutilmoqda",
  checked: "Tekshirildi",
};

export default function ExportButton({ submissions }: ExportButtonProps) {
  async function handleExport() {
    const wb = new ExcelJS.Workbook();
    wb.creator = "PsyTest";
    wb.created = new Date();

    // 1) Test bo'yicha guruhlash
    const groups = new Map<string, SubmissionItem[]>();
    for (const sub of submissions) {
      const testTitle = Array.isArray(sub.tests)
        ? sub.tests[0]?.title_uz
        : sub.tests?.title_uz;
      const key = testTitle || "Nomsiz test";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(sub);
    }

    // 2) UMUMIY varaq — barcha testlar bo'yicha statistika
    const summary = wb.addWorksheet("Umumiy");
    summary.columns = [
      { header: "#",                key: "n",     width: 5  },
      { header: "Test nomi",        key: "test",  width: 40 },
      { header: "Natijalar soni",   key: "count", width: 16 },
      { header: "O'rtacha ball",    key: "avg",   width: 14 },
      { header: "Maksimum ball",    key: "max",   width: 14 },
      { header: "Minimum ball",     key: "min",   width: 14 },
    ];
    summary.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summary.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF18181B" },
    };
    summary.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
    summary.getRow(1).height = 22;

    let idx = 1;
    for (const [testTitle, subs] of groups) {
      const scores = subs.map((s) => s.total_score ?? 0);
      const avg = scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;
      summary.addRow({
        n: idx++,
        test: testTitle,
        count: subs.length,
        avg,
        max: scores.length ? Math.max(...scores) : 0,
        min: scores.length ? Math.min(...scores) : 0,
      });
    }

    // 3) Har test uchun alohida varaq
    const usedNames = new Set<string>();
    let sheetIdx = 0;
    for (const [testTitle, subs] of groups) {
      sheetIdx++;
      let sheetName = sanitizeSheetName(testTitle, `Test ${sheetIdx}`);
      // Ism takrorlanmasligi uchun
      let uniqueName = sheetName;
      let suffix = 2;
      while (usedNames.has(uniqueName.toLowerCase())) {
        const suffixStr = ` (${suffix++})`;
        const baseLen = 31 - suffixStr.length;
        uniqueName = sheetName.slice(0, baseLen) + suffixStr;
      }
      usedNames.add(uniqueName.toLowerCase());

      const ws = wb.addWorksheet(uniqueName);

      // Yuqorida test nomi
      ws.mergeCells("A1:G1");
      const titleCell = ws.getCell("A1");
      titleCell.value = testTitle;
      titleCell.font = { bold: true, size: 14, color: { argb: "FF18181B" } };
      titleCell.alignment = { vertical: "middle", horizontal: "left" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFACC15" }, // sariq
      };
      ws.getRow(1).height = 28;

      // Sarlavhalar
      ws.getRow(3).values = [
        "#",
        "O'quvchi",
        "Sinf",
        "Til",
        "Ball",
        "Holat",
        "Sana",
      ];
      ws.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(3).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF18181B" }, // qora
      };
      ws.getRow(3).alignment = { vertical: "middle", horizontal: "center" };
      ws.getRow(3).height = 22;

      ws.columns = [
        { key: "n",       width: 5  },
        { key: "student", width: 24 },
        { key: "class",   width: 10 },
        { key: "lang",    width: 6  },
        { key: "score",   width: 8  },
        { key: "status",  width: 14 },
        { key: "date",    width: 20 },
      ];

      // Sana bo'yicha tartiblash (eski → yangi)
      const sorted = [...subs].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return da - db;
      });

      sorted.forEach((item, i) => {
        ws.addRow({
          n: i + 1,
          student: item.student_name || "-",
          class: item.class_name || "-",
          lang: item.language?.toUpperCase() || "-",
          score: item.total_score ?? 0,
          status: STATUS_LABEL[item.status ?? ""] ?? item.status ?? "-",
          date: item.created_at
            ? new Date(item.created_at).toLocaleString("uz-UZ")
            : "-",
        });
      });

      // Pastda statistika
      const scores = subs.map((s) => s.total_score ?? 0);
      const avg = scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;
      const statsRow = ws.addRow({});
      ws.addRow({ student: "Jami:",        score: subs.length });
      ws.addRow({ student: "O'rtacha ball:", score: avg });
      ws.addRow({ student: "Maksimum:",    score: scores.length ? Math.max(...scores) : 0 });
      ws.addRow({ student: "Minimum:",     score: scores.length ? Math.min(...scores) : 0 });

      // Statistika qismini bold qilish
      const lastRow = ws.rowCount;
      for (let r = lastRow - 3; r <= lastRow; r++) {
        ws.getRow(r).font = { bold: true };
        ws.getRow(r).getCell(2).alignment = { horizontal: "right" };
      }
      void statsRow;
    }

    // Yuklab olish
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
      className="inline-flex items-center gap-2 border-2 border-zinc-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-900 hover:text-yellow-400"
    >
      📥 Excel
    </button>
  );
}
