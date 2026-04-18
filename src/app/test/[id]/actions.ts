"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
export async function startTest(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const testId = String(formData.get("test_id") || "");
  const studentName = String(formData.get("student_name") || "").trim();
  const className = String(formData.get("class_name") || "").trim();
  const language = String(formData.get("language") || "uz");

  if (!testId || !studentName || !className || !language) {
    throw new Error("Barcha maydonlarni to‘ldiring");
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      test_id: testId,
      student_name: studentName,
      class_name: className,
      language: language,
      status: "submitted",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Submission yaratilmadi");
  }

  redirect(`/test/${testId}/questions?submission=${data.id}`);
}