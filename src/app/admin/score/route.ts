import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export async function POST(req: Request) {
  // Autentifikatsiya tekshiruvi
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const body = await req.json();

    const answerId = String(body.answerId || "");
    const manualScore = Number(body.manual_score ?? 0);

    if (!answerId) {
      return NextResponse.json(
        { error: "answerId topilmadi" },
        { status: 400 }
      );
    }

    // Joriy answer ni olish
    const { data: currentAnswer, error: currentAnswerError } = await supabase
      .from("answers")
      .select("id, submission_id, auto_score")
      .eq("id", answerId)
      .single();

    if (currentAnswerError || !currentAnswer) {
      return NextResponse.json(
        { error: currentAnswerError?.message || "Answer topilmadi" },
        { status: 500 }
      );
    }

    const newFinalScore = (currentAnswer.auto_score ?? 0) + manualScore;

    // Answer yangilash
    const { error: updateAnswerError } = await supabase
      .from("answers")
      .update({
        manual_score: manualScore,
        final_score: newFinalScore,
      })
      .eq("id", answerId);

    if (updateAnswerError) {
      return NextResponse.json(
        { error: updateAnswerError.message },
        { status: 500 }
      );
    }

    // Submission umumiy ballini qayta hisoblash
    const { data: allAnswers, error: allAnswersError } = await supabase
      .from("answers")
      .select("auto_score, manual_score, final_score")
      .eq("submission_id", currentAnswer.submission_id);

    if (allAnswersError || !allAnswers) {
      return NextResponse.json(
        { error: allAnswersError?.message || "Answers topilmadi" },
        { status: 500 }
      );
    }

    const autoScoreTotal = allAnswers.reduce(
      (sum, item) => sum + (item.auto_score ?? 0),
      0
    );
    const manualScoreTotal = allAnswers.reduce(
      (sum, item) => sum + (item.manual_score ?? 0),
      0
    );
    const totalScore = allAnswers.reduce(
      (sum, item) => sum + (item.final_score ?? 0),
      0
    );

    const { error: updateSubmissionError } = await supabase
      .from("submissions")
      .update({
        auto_score: autoScoreTotal,
        manual_score: manualScoreTotal,
        total_score: totalScore,
        status: "checked",
      })
      .eq("id", currentAnswer.submission_id);

    if (updateSubmissionError) {
      return NextResponse.json(
        { error: updateSubmissionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, totalScore });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server xatoligi" },
      { status: 500 }
    );
  }
}
