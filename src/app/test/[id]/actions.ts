"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import {
  createSubmissionToken,
  SUBMISSION_COOKIE_NAME,
} from "../../../lib/submission-session";

export async function startTest(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const testId = String(formData.get("test_id") || "");
  const studentName = String(formData.get("student_name") || "").trim();
  const className = String(formData.get("class_name") || "").trim();
  const language = String(formData.get("language") || "uz");

  if (!testId || !studentName || !className || !language) {
    throw new Error("Barcha maydonlarni to‘ldiring");
  }

  // Test mavjudligini tekshirish (orphan submission'larni oldini oladi)
  const { data: testRow, error: testErr } = await supabase
    .from("tests")
    .select("id")
    .eq("id", testId)
    .single();

  if (testErr || !testRow) {
    throw new Error("Test topilmadi");
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

  // Submission token'ni HttpOnly cookie'ga yozamiz — keyingi sahifalar
  // (questions submit, result) faqat shu cookie bilan ochiladi.
  const { token, maxAge } = await createSubmissionToken(data.id);
  const cookieStore = await cookies();
  cookieStore.set(SUBMISSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  redirect(`/test/${testId}/questions?submission=${data.id}`);
}
