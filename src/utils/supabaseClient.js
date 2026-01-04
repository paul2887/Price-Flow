import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bvavjrcrvllimrxqijsi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Cnh-BJR2_qUdUAGFIXLz5Q_cFhyrq5i";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
