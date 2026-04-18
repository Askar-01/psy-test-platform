"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ManualScoreInputProps = {
  answerId: string;
  defaultValue: number;
};

export default function ManualScoreInput({
  answerId,
  defaultValue,
}: ManualScoreInputProps) {
  const router = useRouter();
  const [value, setValue] = useState<number>(defaultValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      setSaved(false);

      const res = await fetch("/admin/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, manual_score: value }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Xatolik yuz berdi");
        return;
      }

      setSaved(true);
      // window.location.reload() o'rniga router.refresh() ishlatildi
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Server bilan bog'lanishda xato bo'ldi"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          setValue(Number(e.target.value));
          setSaved(false);
        }}
        className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "..." : "Saqlash"}
      </button>
      {saved && (
        <span className="text-xs text-green-600">✓ Saqlandi</span>
      )}
    </div>
  );
}
