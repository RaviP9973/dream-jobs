import { auth } from "@/app/utils/auth";
import { getMyJobs } from "@/app/(mainLayout)/my-jobs/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const data = await getMyJobs(session.user.id, cursor);

  return NextResponse.json(data);
}