"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import {
  verifySubmissionToken,
  SUBMISSION_COOKIE_NAME,
} from "../../../../lib/submission-session";

export async function submitAnswers(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const testId = String(formData.get("test_id") || "");
  const submissionId = String(formData.get("submission_id") || "");

  if (!testId || !submissionId) {
    throw new Error("Test yoki submission topilmadi");
  }

  // Submission token tekshiruvi — boshqa odam bu submissionId'ni
  // bilsa ham javoblarni overwrite qila olmasin.
  const cookieStore = await cookies();
  const subToken = cookieStore.get(SUBMISSION_COOKIE_NAME)?.value;
  const tokenOk = await verifySubmissionToken(submissionId, subToken);
  if (!tokenOk) {
    throw new Error(
      "Bu testni yuborish ruxsati yo'q. Iltimos, testni qaytadan boshlang."
    );
  }

  // Submission allaqachon admin tomonidan tekshirilgan bo'lsa, qayta yozishni blok qilamiz
  const { data: existingSub } = await supabase
    .from("submissions")
    .select("status")
    .eq("id", submissionId)
    .single();

  if (existingSub?.status === "checked") {
    throw new Error(
      "Bu test allaqachon tekshirilgan, javoblarni o'zgartirib bo'lmaydi."
    );
  }

  // Barcha savollarni options bilan birga bir so'rovda olish (N+1 muammosi hal qilindi)
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(`
      id,
      type,
      order_no,
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

  type AnswerInsert = {
    submission_id: string;
    question_id: string;
    selected_option_id: string | null;
    selected_option_ids: string[] | null;
    text_answer: string | null;
    auto_score: number;
    manual_score: number;
    final_score: number;
  };

  const answersToInsert: AnswerInsert[] = [];

  for (const question of questions) {
    if (question.type === "yes_no") {
      const answer = String(formData.get(`question_${question.id}`) || "");
      if (!answer) continue;

      const autoScore = answer === "yes" ? 1 : 0;

      answersToInsert.push({
        submission_id: submissionId,
        question_id: question.id,
        selected_option_id: null,
        selected_option_ids: null,
        text_answer: answer,
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

      const opts = (question.options as { id: string; score: number | null }[]) ?? [];
      const selectedOption = opts.find((o) => o.id === selectedOptionId);
      const autoScore = selectedOption?.score ?? 0;

      answersToInsert.push({
        submission_id: submissionId,
        question_id: question.id,
        selected_option_id: selectedOptionId,
        selected_option_ids: null,
        text_answer: null,
        auto_score: autoScore,
        manual_score: 0,
        final_score: autoScore,
      });
    }

    if (question.type === "multi_select") {
      // formData.getAll bir nechta value qaytaradi (checkbox uchun)
      const selectedRaw = formData.getAll(`question_${question.id}`).map(String);
      const opts = (question.options as { id: string; score: number | null }[]) ?? [];

      // faqat haqiqiy option ID'larini qabul qilamiz (xavfsizlik)
      const selectedIds = selectedRaw.filter((id) => opts.some((o) => o.id === id));

      // Validatsiya: kamida 1 ta variant tanlangan bo'lishi kerak
      if (selectedIds.length === 0) {
        throw new Error(
          `${question.order_no}-savolda kamida bitta variantni tanlang`
        );
      }

      // Ball: tanlangan barcha option'lar score'lari yig'indisi
      const autoScore = selectedIds.reduce((sum, id) => {
        const opt = opts.find((o) => o.id === id);
        return sum + (opt?.score ?? 0);
      }, 0);

      answersToInsert.push({
        submission_id: submissionId,
        question_id: question.id,
        selected_option_id: null,
        selected_option_ids: selectedIds,
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
        selected_option_ids: null,
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
