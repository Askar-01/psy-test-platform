"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function submitAnswers(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const testId = String(formData.get("test_id") || "");
  const submissionId = String(formData.get("submission_id") || "");

  if (!testId || !submissionId) {
    throw new Error("Test yoki submission topilmadi");
  }

  // Barcha savollarni options bilan birga bir so'rovda olish (N+1 muammosi hal qilindi)
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(`
      id,
      type,
      options (
        id,
        score
      )
    `)
    .eq("test_id", testId)
    .order("order_no", { ascending: true });

  if (questionsError || !questions) {
    throw new Error(questionsError?.message || "Savollar topilmadi");
  }

  const answersToInsert: {
    submission_id: string;
    question_id: string;
    selected_option_id: string | null;
    text_answer: string | null;
    auto_score: number;
    manual_score: number;
    final_score: number;
  }[] = [];

  for (const question of questions) {
    if (question.type === "yes_no") {
      const answer = String(formData.get(`question_${question.id}`) || "");
      if (!answer) continue;

      // yes_no uchun options jadvalidagi birinchi mos variantni topish
      // Agar options mavjud bo'lsa, score olishga harakat qilish
      // Aks holda: yes=1, no=0
      const yesOption = (question.options as { id: string; score: number | null }[])?.find(
        (o) => o.id === answer
      );
      const autoScore = yesOption?.score ?? (answer === "yes" ? 1 : 0);

      answersToInsert.push({
        submission_id: submissionId,
        question_id: question.id,
        selected_option_id: null,
        text_answer: answer, // "yes" yoki "no"
        auto_score: autoScore,
        manual_score: 0,
        final_score: autoScore,
      });
    }

    if (question.type === "multiple_choice") {
      const selectedOptionId = String(
        formData.get(`question_${question.id}`) || ""
      );
      if (!selectedOptionId) continue;

      // options allaqachon yuklangan — bazaga qayta so'rov yo'q
      const selectedOption = (
        question.options as { id: string; score: number | null }[]
      )?.find((o) => o.id === selectedOptionId);
      const autoScore = selectedOption?.score ?? 0;

      answersToInsert.push({
        submission_id: submissionId,
        question_id: question.id,
        selected_option_id: selectedOptionId,
        text_answer: null,
        auto_score: autoScore,
        manual_score: 0,
        final_score: autoScore,
      });
    }

    if (question.type === "text") {
      const textAnswer = String(
        formData.get(`question_${question.id}`) || ""
      ).trim();

      answersToInsert.push({
        submission_id: submissionId,
        question_id: question.id,
        selected_option_id: null,
        text_answer: textAnswer || null,
        auto_score: 0,
        manual_score: 0,
        final_score: 0,
      });
    }
  }

  // Eski javoblarni o'chirish
  const { error: deleteError } = await supabase
    .from("answers")
    .delete()
    .eq("submission_id", submissionId);

  if (deleteError) throw new Error(deleteError.message);

  // Yangi javoblarni saqlash
  if (answersToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("answers")
      .insert(answersToInsert);

    if (insertError) throw new Error(insertError.message);
  }

  const autoScoreTotal = answersToInsert.reduce(
    (sum, item) => sum + item.auto_score,
    0
  );

  // Submission yangilash
  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      auto_score: autoScoreTotal,
      total_score: autoScoreTotal,
      status: "pending_review",
    })
    .eq("id", submissionId);

  if (updateError) throw new Error(updateError.message);

  redirect(`/test/${testId}/result?submission=${submissionId}`);
}
