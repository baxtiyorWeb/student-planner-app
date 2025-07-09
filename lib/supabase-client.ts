import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://your-supabase-url.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "SUPABASE_ANON_KEY",
  {
    auth: { 
      storage: {
        getItem: () => {
          return Promise.resolve("FETCHED_COOKIE");
        },
        setItem: () => {},
        removeItem: () => {},
      },
    },
  }
);
