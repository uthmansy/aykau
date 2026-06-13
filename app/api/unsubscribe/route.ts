// app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/services/supabase/client"; // Use service role key here if possible, or standard client

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?error=invalid_token", req.url));
  }

  try {
    // 1. Find the token
    const { data: unsub, error: findError } = await supabase
      .from("email_unsubscribes")
      .select("user_id")
      .eq("token", token)
      .single();

    if (findError || !unsub) {
      return NextResponse.redirect(
        new URL("/?error=already_unsubscribed", req.url)
      );
    }

    // 2. Update user preferences (using service role client is best here)
    const { error: updateError } = await supabase.rpc("update_artisan_alerts", {
      p_user_id: unsub.user_id,
      p_enabled: false,
    });

    if (updateError) throw updateError;

    // 3. Invalidate token
    await supabase.from("email_unsubscribes").delete().eq("token", token);

    // 4. Redirect to success page
    return NextResponse.redirect(
      new URL("/dashboard/settings?unsubscribed=true", req.url)
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.redirect(new URL("/?error=server_error", req.url));
  }
}
