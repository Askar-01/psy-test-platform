type SubmittedPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    submission?: string;
  }>;
};

export default async function SubmittedPage({
  params,
  searchParams,
}: SubmittedPageProps) {
  const { id } = await params;
  const { submission } = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Javobingiz qabul qilindi
        </h1>
        <p className="mt-4 text-gray-600">
          Test muvaffaqiyatli topshirildi. Natija adminga yuborildi.
        </p>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Test ID:</span> {id}
          </p>
          <p>
            <span className="font-semibold">Submission ID:</span>{" "}
            {submission || "topilmadi"}
          </p>
        </div>
      </div>
    </main>
  );
}