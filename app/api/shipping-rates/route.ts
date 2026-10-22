import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitKey } from "@/lib/shipping/rate-limit";
import { errorResponse, providerErrorResponse, rateLimitResponse, readJsonBody, RequestBodyError } from "@/lib/shipping/http";
import { buildShippingRateResponse } from "@/lib/shipping/service";
import { validateShippingRateRequest } from "@/lib/shipping/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = checkRateLimit(rateLimitKey(request.headers));
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await readJsonBody(request);
    const validation = validateShippingRateRequest(body);
    if (!validation.ok) return errorResponse("invalid_request", "Please correct the highlighted shipment fields.", 400, validation.fieldErrors);
    return NextResponse.json(await buildShippingRateResponse(validation.value), { status: 200 });
  } catch (error) {
    if (error instanceof RequestBodyError) return errorResponse("invalid_request", error.message, 400);
    return providerErrorResponse(error);
  }
}
