import { NextRequest, NextResponse } from "next/server";
import insertEvent from "~/db/insertEvent";
import { DispatchableEventSchema } from "@codaco/analytics";

// Allow CORS requests from anywhere.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const event = (await request.json()) as unknown;
  const parsedEvent = DispatchableEventSchema.safeParse(event);

  if (!parsedEvent.success) {
    return NextResponse.json(
      { error: "Invalid event" },
      { status: 400, headers: corsHeaders }
    );
  }

  const formattedEvent = {
    ...parsedEvent.data,
    ...(parsedEvent.data.type === "Error" && {
      type: "Error",
      message: parsedEvent.data.error.message,
      name: parsedEvent.data.error.name,
      stack: parsedEvent.data.error.stack,
    }),
    timestamp: new Date(parsedEvent.data.timestamp), // Convert back into a date object
  };

  const result = await insertEvent(formattedEvent);

  if (result.error) {
    return NextResponse.json(
      { error: "Error inserting events" },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json({ event }, { status: 200, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
