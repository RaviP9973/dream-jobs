import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
	return NextResponse.json(
		{
			success: false,
			error: "Vapi generate route is not implemented yet.",
		},
		{ status: 501 }
	);
}
