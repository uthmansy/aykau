// app/api/jobs/photos/route.ts
import { supabase } from "@/services/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing path parameter" },
        { status: 400 }
      );
    }

    // Generate signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from("job-photos")
      .createSignedUrl(path, 60 * 60);

    if (error) throw error;

    return NextResponse.json({ url: data.signedUrl });
  } catch (error: any) {
    console.error("Signed URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate photo URL" },
      { status: 500 }
    );
  }
}
