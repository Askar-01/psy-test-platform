"use client";

import { useState, useTransition } from "react";
import { createTest } from "./actions";

type OptionDraft = {
  text_uz: string;
  text_ru: string;
  text_kaa: string;
  score: string;
};

type QuestionDraft = {
  type: "yes_no" | "multiple_choice" | "multi_select" | "text";
  text_uz: string;
  text_ru: string;
  text_kaa: string;
  options: OptionDraft[];
};

const QUESTION_TYPES = [
  { value: "yes_no", label: "✅ Ha / Yo'q" },
  { value: "multiple_choice", label: "🔘 Bir variant (radio)" },
  { value: "multi_select", label: "☑️ Ko'p variant (checkbox)" },
  { value: "text", label: "📝 Matnli javob" },
];

function emptyOption(): OptionDraft {
  return { text_uz: "", text_ru: "", text_kaa: "", score: "0" };
}

function emptyQuestion(): QuestionDraft {
  return {
    type: "yes_no",
    text_uz: "",
    text_ru: "",
    text_kaa: "",
    options: [emptyOption(), emptyOption()],
  };
}

export default function NewTestPage() {
  const [titleUz, setTitleUz] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [titleKaa, setTitleKaa] = useState("");
  const [descUz, setDescUz] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Savol o'zgartirish
  function updateQuestion(qi: number, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, ...patch } : q))
    );
  }

  // Variant o'zgartirish
  function updateOption(qi: number, oi: number, patch: Partial<OptionDraft>) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oi ? { ...o, ...patch } : o
              ),
            }
          : q
      )
    );
  }

  // Variant qo'shish
  function addOption(qi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, emptyOption()] } : q
      )
    );
  }

  // Variant o'chirish
  function removeOption(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.filter((_, j) => j !== oi) }
          : q
      )
    );
  }

  // Savol qo'shish
  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  // Savol o'chirish
  function removeQuestion(qi: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  }

  // Savol tartibini o'zgartirish
  function moveQuestion(qi: number, dir: -1 | 1) {
    setQuestions((prev) => {
      const next = [...prev];
      const target = qi + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[qi], next[target]] = [next[target], next[qi]];
      return next;
    });
  }

  // Submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titleUz.trim()) {
      setError("Test nomi (O'zbekcha) kiritilishi shart!");
      return;
    }
    if (questions.length === 0) {
      setError("Kamida 1 ta savol qo'shing!");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text_uz.trim()) {
        setError(`${i + 1}-savol matni (O'zbekcha) bo'sh!`);
        return;
      }
      if (
        (q.type === "multiple_choice" || q.type === "multi_select") &&
        q.options.filter((o) => o.text_uz.trim()).length < 2
      ) {
        setError(`${i + 1}-savol uchun kamida 2 ta variant kiriting!`);
        return;
      }
    }

    const data = {
      title_uz: titleUz,
      title_ru: titleRu,
      title_kaa: titleKaa,
      description_uz: descUz,
      questions: questions.map((q) => ({
        ...q,
        options: q.options
          .filter((o) => o.text_uz.trim())
          .map((o) => ({ ...o, score: Number(o.score) || 0 })),
      })),
    };

    const fd = new FormData();
    fd.append("data", JSON.stringify(data));

    startTransition(async () => {
      try {
        await createTest(fd);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-lg shadow-md">
              🧠
            </div>
            <div>
              <p className="text-xs text-gray-400">Admin panel</p>
              <h1 className="text-lg font-black text-gray-900">Yangi test qo&apos;shish</h1>
            </div>
          </div>
          <a
            href="/admin/results"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            ← Orqaga
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-8 py-8 space-y-6">
        {/* Xato */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Test ma'lumotlari */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-md">
          <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4">
            <h2 className="font-black text-gray-800">📋 Test ma&apos;lumotlari</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500">
                  Nomi — O&apos;zbekcha <span className="text-red-500">*</span>
                </label>
                <input
                  value={titleUz}
                  onChange={(e) => setTitleUz(e.target.value)}
                  placeholder="Masalan: Stres darajasi testi"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500">
                  Nomi — Ruscha
                </label>
                <input
                  value={titleRu}
                  onChange={(e) => setTitleRu(e.target.value)}
                  placeholder="Тест уровня стресса"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500">
                  Nomi — Qaraqalpaqcha
                </label>
                <input
                  value={titleKaa}
                  onChange={(e) => setTitleKaa(e.target.value)}
                  placeholder="Stress dárejesi testi"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-500">
                Tavsif (O&apos;zbekcha)
              </label>
              <textarea
                value={descUz}
                onChange={(e) => setDescUz(e.target.value)}
                placeholder="Test haqida qisqacha ma'lumot..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Savollar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-gray-800">❓ Savollar ({questions.length} ta)</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
            >
              + Savol qo&apos;shish
            </button>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="overflow-hidden rounded-3xl bg-white shadow-md">
              {/* Savol header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-xs font-black text-white">
                    {qi + 1}
                  </span>
                  <span className="text-sm font-bold text-gray-600">-savol</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveQuestion(qi, -1)}
                    disabled={qi === 0}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 disabled:opacity-30"
                    title="Yuqoriga"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(qi, 1)}
                    disabled={qi === questions.length - 1}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 disabled:opacity-30"
                    title="Pastga"
                  >
                    ↓
                  </button>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50"
                      title="O'chirish"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Savol turi */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-500">Savol turi</label>
                  <div className="flex flex-wrap gap-2">
                    {QUESTION_TYPES.map((qt) => (
                      <button
                        key={qt.value}
                        type="button"
                        onClick={() =>
                          updateQuestion(qi, {
                            type: qt.value as QuestionDraft["type"],
                            options:
                              qt.value === "yes_no" || qt.value === "text"
                                ? []
                                : q.options.length >= 2
                                ? q.options
                                : [emptyOption(), emptyOption()],
                          })
                        }
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          q.type === qt.value
                            ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md"
                            : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {qt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Savol matni */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-500">
                      Savol — O&apos;zbekcha <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={q.text_uz}
                      onChange={(e) => updateQuestion(qi, { text_uz: e.target.value })}
                      placeholder="Savol matni..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-500">Ruscha</label>
                    <textarea
                      value={q.text_ru}
                      onChange={(e) => updateQuestion(qi, { text_ru: e.target.value })}
                      placeholder="Текст вопроса..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-500">
                      Qaraqalpaqcha
                    </label>
                    <textarea
                      value={q.text_kaa}
                      onChange={(e) => updateQuestion(qi, { text_kaa: e.target.value })}
                      placeholder="Soraw mátni..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Variantlar (multiple_choice yoki multi_select) */}
                {(q.type === "multiple_choice" || q.type === "multi_select") && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500">
                        Variantlar ({q.options.length} ta)
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(qi)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                      >
                        + Variant
                      </button>
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-start gap-2">
                          <span className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-500">
                            {oi + 1}
                          </span>
                          <div className="grid flex-1 gap-2 sm:grid-cols-4">
                            <input
                              value={opt.text_uz}
                              onChange={(e) => updateOption(qi, oi, { text_uz: e.target.value })}
                              placeholder="O'zbekcha *"
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            />
                            <input
                              value={opt.text_ru}
                              onChange={(e) => updateOption(qi, oi, { text_ru: e.target.value })}
                              placeholder="Ruscha"
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            />
                            <input
                              value={opt.text_kaa}
                              onChange={(e) => updateOption(qi, oi, { text_kaa: e.target.value })}
                              placeholder="Qaraqalpaqcha"
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            />
                            <input
                              type="number"
                              value={opt.score}
                              onChange={(e) => updateOption(qi, oi, { score: e.target.value })}
                              placeholder="Ball"
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            />
                          </div>
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qi, oi)}
                              className="mt-2 text-red-400 transition hover:text-red-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-gray-400 mt-1">
                        💡 Ball — avtomatik hisoblash uchun (0 qo&apos;ysa hisoblanmaydi)
                      </p>
                    </div>
                  </div>
                )}

                {/* Ha/Yo'q tushuntirish */}
                {q.type === "yes_no" && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-600">
                    ℹ️ Ha/Yo&apos;q savolida variantlar avtomatik (Ha = 1 ball, Yo&apos;q = 0 ball)
                  </div>
                )}

                {/* Text tushuntirish */}
                {q.type === "text" && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-600">
                    ℹ️ Matnli javoblar qo&apos;lda tekshiriladi (admin paneldan ball beriladi)
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Savol qo'shish (pastda) */}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-3xl border-2 border-dashed border-blue-200 py-4 text-sm font-bold text-blue-400 transition hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
          >
            + Yangi savol qo&apos;shish
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-md">
          <p className="text-sm text-gray-500">
            Jami: <span className="font-black text-gray-800">{questions.length}</span> ta savol
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-3 font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "⏳ Saqlanmoqda..." : "💾 Testni saqlash"}
          </button>
        </div>
      </form>
    </main>
  );
}
