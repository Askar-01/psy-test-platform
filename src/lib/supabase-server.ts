import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Server tomonida SERVICE_ROLE key ishlatiladi (RLS ni bypass qiladi)
  // Agar SERVICE_ROLE yo'q bo'lsa, ANON key ga fallback
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key);
}
