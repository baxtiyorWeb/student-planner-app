import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL! ||
    "https://pbsqjlxqlvywhzhorvmc.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic3FqbHhxbHZ5d2h6aG9ydm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjY4OTgsImV4cCI6MjA2Njk0Mjg5OH0.QiF9qMJVchfh2RIf_xsS_XUUe0POVg4xfX5pFYaVa9w",
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
