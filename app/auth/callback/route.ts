import { createClient } from "@/services/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log(
    "Auth callback - code:",
    code ? "present" : "missing",
    "next:",
    next
  );

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Auth callback - exchange result:", {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: error?.message,
    });

    if (!error && data.session) {
      // Session was successfully exchanged, redirect with cookies set
      const response = NextResponse.redirect(`${origin}${next}`);
      return response;
    } else {
      console.error("Auth callback - exchange error:", error);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
