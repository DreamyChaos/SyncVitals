import { NextResponse } from "next/server";

export async function GET() {
  const urlPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRolePresent = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return NextResponse.json({
    urlPresent,
    anonPresent,
    serviceRolePresent,
  });
}