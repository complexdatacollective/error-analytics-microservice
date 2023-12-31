import type { NextRequest } from "next/server";
import { WebServiceClient } from "@maxmind/geoip2-node";
import { ensureError } from "./utils";

type GeoLocation = {
  countryCode: string;
};

export type AnalyticsEventBase = {
  type:
    | "InterviewCompleted"
    | "InterviewStarted"
    | "ProtocolInstalled"
    | "AppSetup"
    | "Error";
};

export type AnalyticsEvent = AnalyticsEventBase & {
  type:
    | "InterviewCompleted"
    | "InterviewStarted"
    | "ProtocolInstalled"
    | "AppSetup";
  metadata?: Record<string, unknown>;
};

export type AnalyticsError = AnalyticsEventBase & {
  type: "Error";
  error: {
    message: string;
    details: string;
    stacktrace: string;
    path: string;
  };
};

export type AnalyticsEventOrError = AnalyticsEvent | AnalyticsError;

export type AnalyticsEventOrErrorWithTimestamp = AnalyticsEventOrError & {
  timestamp: Date;
};

export type DispatchableAnalyticsEvent = AnalyticsEventOrErrorWithTimestamp & {
  installationId: string;
  geolocation?: GeoLocation;
};

type RouteHandlerConfiguration = {
  maxMindAccountId: string;
  maxMindLicenseKey: string;
  platformUrl?: string;
  getInstallationId: () => Promise<string>;
  WebServiceClient: typeof WebServiceClient;
};

export const createRouteHandler = ({
  maxMindAccountId,
  maxMindLicenseKey,
  platformUrl = "https://analytics.networkcanvas.com",
  getInstallationId,
  WebServiceClient,
}: RouteHandlerConfiguration) => {
  return async (request: NextRequest) => {
    try {
      const maxMindClient = new WebServiceClient(
        maxMindAccountId,
        maxMindLicenseKey,
        {
          host: "geolite.info",
        }
      );

      const installationId = await getInstallationId();

      const event =
        (await request.json()) as AnalyticsEventOrErrorWithTimestamp;

      const ip = await fetch("https://api64.ipify.org").then((res) =>
        res.text()
      );

      const { country } = await maxMindClient.country(ip);
      const countryCode = country?.isoCode ?? "Unknown";

      const dispatchableEvent: DispatchableAnalyticsEvent = {
        ...event,
        installationId,
        geolocation: {
          countryCode,
        },
      };

      console.log(dispatchableEvent);

      // Forward to microservice
      const response = await fetch(`${platformUrl}/api/event`, {
        keepalive: true,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dispatchableEvent),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to forward event to microservice: ${response.statusText}`
        );
      }

      return new Response(
        JSON.stringify({ message: "Event forwarded successfully" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (e) {
      const error = ensureError(e);
      console.error("Error in route handler:", error);

      // Return an appropriate error response
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };
};

export const makeEventTracker =
  ({ endpoint }: { endpoint: string }) =>
  async (event: AnalyticsEventOrError) => {
    const eventWithTimeStamp = {
      ...event,
      timestamp: new Date(),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify(eventWithTimeStamp),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to send analytics event: ${response.statusText}`
        );
      }
    } catch (e) {
      const error = ensureError(e);

      console.error("Error sending analytics event:", error.message);
    }
  };
