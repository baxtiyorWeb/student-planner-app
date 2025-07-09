import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export const createServerSupabaseClient = (request: NextRequest) => {
  let response = NextResponse.next();
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL! ||
    "https://pbsqjlxqlvywhzhorvmc.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic3FqbHhxbHZ5d2h6aG9ydm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjY4OTgsImV4cCI6MjA2Njk0Mjg5OH0.QiF9qMJVchfh2RIf_xsS_XUUe0POVg4xfX5pFYaVa9w";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response };
};
