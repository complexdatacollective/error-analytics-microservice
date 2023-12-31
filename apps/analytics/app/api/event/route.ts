import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import type { DispatchableAnalyticsEvent } from "@codaco/analytics";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const event = (await request.json()) as DispatchableAnalyticsEvent;

  const timestamp = JSON.stringify(event.timestamp || new Date().toISOString());

  // determine if this is an error and push it to the errors table
  if (event.type === "Error") {
    const errorPayload = event.error;
    try {
      await sql`INSERT INTO Errors (message, details, stacktrace, timestamp, installationid, path) VALUES (${errorPayload.message}, ${errorPayload.details}, ${errorPayload.stacktrace}, ${timestamp}, ${event.installationId}, ${errorPayload.path});`;
      return NextResponse.json(
        { errorPayload },
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      return NextResponse.json(
        { error },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // event is not an error
  // push the event to the events table

  try {
    await sql`INSERT INTO EVENTS (type, metadata, timestamp, installationid, isocode) VALUES(
      ${event.type},
      ${JSON.stringify(event.metadata)},
      ${timestamp},
      ${event.installationId},
      ${event.geolocation?.countryCode}
    );`;
    return NextResponse.json({ event }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
