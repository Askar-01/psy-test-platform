"use server";

import { cookies } from "next/headers";
import { verifyAdminSession } from "../../../../lib/admin-session";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { redirect } from "next/navigation";

type OptionInput = {
  text_uz: string;
  text_ru: string;
  text_kaa: string;
  score: number;
};

type QuestionInput = {
  type: "yes_no" | "multiple_choice" | "multi_select" | "text";
  text_uz: string;
  text_ru: string;
  text_kaa: string;
  options: OptionInput[];
};

type TestInput = {
  title_uz: string;
  title_ru: string;
  title_kaa: string;
  description_uz: string;
  questions: QuestionInput[];
};

export async function createTest(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const ok = await verifyAdminSession(token);
  if (!ok) redirect("/admin/login");

  const raw = formData.get("data") as string;
  const { title_uz, title_ru, title_kaa, description_uz, questions }: TestInput =
    JSON.parse(raw);

  if (!title_uz?.trim()) {
    throw new Error("Test nomi (O'zbekcha) kiritilishi shart");
  }

  const supabase = createSupabaseServerClient();

  // Test yaratish
  const { data: test, error: testError } = await supabase
    .from("tests")
    .insert({ title_uz, title_ru, title_kaa, description_uz })
    .select("id")
    .single();

  if (testError || !test) {
    throw new Error(testError?.message || "Test yaratishda xatolik");
  }

  // Savollar yaratish
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    const { data: question, error: qError } = await supabase
      .from("questions")
      .insert({
        test_id: test.id,
        type: q.type,
        order_no: i + 1,
        text_uz: q.text_uz,
        text_ru: q.text_ru || null,
        text_kaa: q.text_kaa || null,
      })
      .select("id")
      .single();

    if (qError || !question) continue;

    // Variantlar yaratish (multiple_choice va multi_select uchun)
    if (
      (q.type === "multiple_choice" || q.type === "multi_select") &&
      q.options?.length > 0
    ) {
      await supabase.from("options").insert(
        q.options.map((opt) => ({
          question_id: question.id,
          text_uz: opt.text_uz,
          text_ru: opt.text_ru || null,
          text_kaa: opt.text_kaa || null,
          score: Number(opt.score) || 0,
        }))
      );
    }
  }

  redirect("/admin/results");
}
