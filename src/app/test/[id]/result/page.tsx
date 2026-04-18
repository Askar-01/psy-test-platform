import { createSupabaseServerClient } from "../../../../lib/supabase-server";

type ResultPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    submission?: string;
  }>;
};

export default async function ResultPage({
  params,
  searchParams,
}: ResultPageProps) {
  const { id } = await params;
  const { submission } = await searchParams;

  const supabase = createSupabaseServerClient();

  const { data: submissionData } = await supabase
    .from("submissions")
    .select("auto_score, total_score")
    .eq("id", submission)
    .single();

  const { data: category } = await supabase
    .from("categories")
    .select(`
      min_score,
      max_score,
      interpretation_low_uz,
      interpretation_mid_uz,
      interpretation_high_uz
    `)
    .eq("test_id", id)
    .single();

  let interpretation = "";

  if (submissionData && category) {
    const score = submissionData.total_score || 0;

    if (score <= category.max_score / 3) {
      interpretation = category.interpretation_low_uz;
    } else if (score <= (category.max_score * 2) / 3) {
      interpretation = category.interpretation_mid_uz;
    } else {
      interpretation = category.interpretation_high_uz;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Natijangiz
        </h1>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-lg text-gray-800">
          <p>
            <span className="font-semibold">Ball:</span>{" "}
            {submissionData?.total_score ?? 0}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800">
          <p className="font-semibold">Tahlil:</p>
          <p className="mt-2">
            {interpretation || "Natija topilmadi"}
          </p>
        </div>
      </div>
    </main>
  );
}