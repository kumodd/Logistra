# Shipping rate and fulfilment calculator

The calculator is implemented inside the Next.js App Router. It uses server route handlers so Shiprocket credentials, bearer tokens, the verified Logistra origin, and approved Logistra pricing never enter browser code.

## Architecture

- `POST /api/shipping-rates` performs one server-side Shiprocket serviceability lookup.
- `POST /api/fulfilment-comparison` uses the same shipment and destination for the current warehouse and the configured Logistra origin.
- `lib/shipping/shiprocket.ts` owns authentication, per-process token caching, one-time 401 reauthentication, timeouts, and a short-lived quote cache. Token state is held on `globalThis` so Next.js development reloads and warm server instances reuse it instead of logging in for every route request.
- `lib/shipping/normalize.ts` removes provider-specific response details and returns only the fields used by the UI.
- `lib/shipping/calculations.ts` keeps shipping-only charges separate from fully loaded fulfilment costs.
- `lib/shipping/config.ts` reads server-only environment configuration.
- `components/shipping-calculator.tsx` is the client UI and communicates only with the two internal routes.

Both live scenarios currently use the same configured Shiprocket account. A rate returned for a configured Logistra origin is therefore labelled as a Shiprocket account serviceability response; it is not represented as a negotiated Logistra carrier contract.

## Environment setup

Copy `.env.example` to a local `.env.local` and set a dedicated Shiprocket API user:

```dotenv
SHIPROCKET_EMAIL=dedicated-api-user@example.com
SHIPROCKET_PASSWORD=keep-this-server-only
STANDARD_RATE_ESTIMATES_ENABLED=true
STANDARD_LOGISTRA_ORIGIN_PINCODE=801103
LOGISTRA_FULFILMENT_ENABLED=false
LOGISTRA_ORIGIN_PINCODE=
LOGISTRA_FACILITY_VERIFIED=false
LOGISTRA_PRICING_CONFIG_JSON=
```

Create the API user in the Shiprocket seller dashboard under Settings → API → Add New API User. Use that API user's credentials, not the main dashboard login. Configure the same variables in the production hosting environment as encrypted server-side secrets. Never add them to `NEXT_PUBLIC_*`, source files, browser requests, logs, or committed `.env` files.

When Shiprocket credentials are configured, live provider serviceability takes precedence. The current warehouse uses the pickup PIN entered by the visitor. The Logistra scenario uses `STANDARD_LOGISTRA_ORIGIN_PINCODE` as its pickup PIN, through the same Shiprocket serviceability account. If credentials are unavailable, `STANDARD_RATE_ESTIMATES_ENABLED=true` allows the clearly labelled temporary standard estimate fallback; set it to false to make the calculator live-only.

With live credentials configured, Shiprocket quotes take precedence. The Logistra live scenario remains unavailable until all of these are true:

- `LOGISTRA_FULFILMENT_ENABLED=true`
- `LOGISTRA_FACILITY_VERIFIED=true`
- `LOGISTRA_ORIGIN_PINCODE` is a verified six-digit origin PIN code
- the applicable Shiprocket account and rate-display permissions are approved

The standard fallback assumes `STANDARD_LOGISTRA_ORIGIN_PINCODE` (default `801103`) for the illustrative Logistra scenario. For live comparison, also set `LOGISTRA_FULFILMENT_ENABLED=true` and `LOGISTRA_FACILITY_VERIFIED=true` only after confirming that origin is an operational Logistra pickup facility. Confirm the operating facility and replace the fallback before relying on results commercially.

The temporary fallback table is centralised in `lib/shipping/standard.ts` (`STANDARD_ESTIMATE_PRICING`): the current development values are ₹95/₹120/₹155/₹240 for the first 0.5/1/2/5 kg bands, route adjustments of ₹0/₹25/₹55/₹75, and a ₹30 COD charge. These are placeholders for testing, not published Logistra rates.

## Approved Logistra pricing

`LOGISTRA_PRICING_CONFIG_JSON` is optional and server-only. The parser accepts this shape, with no default amounts:

```json
{
  "version": "OWNER_CONFIRMED_VERSION",
  "effectiveDate": "OWNER_CONFIRMED_DATE",
  "currency": "INR",
  "gstTreatment": "inclusive",
  "approvalStatus": "approved",
  "publicDisplay": true,
  "fees": {}
}
```

The `fees` object can contain approved numeric values for `pickAndPackPerOrder`, `packagingPerOrder`, `storagePerOrder`, `receivingPerOrder`, `putawayPerOrder`, `returnsPerOrder`, `otherPerOrder`, `fixedMonthly`, and `inventoryTransferMonthly`. `publicDisplay: true` is an explicit owner approval that these figures may be returned to website visitors. Missing values stay unavailable and are not converted to zero. The calculator does not show a fully loaded total until material cost inputs, monthly volume, and GST treatment are complete.

## Request shapes

`POST /api/shipping-rates` accepts:

```json
{
  "pickupPincode": "400001",
  "deliveryPincode": "800001",
  "shipment": {
    "weightKg": 0.5,
    "lengthCm": 20,
    "breadthCm": 15,
    "heightCm": 10,
    "paymentMode": "prepaid",
    "declaredValue": 1000
  }
}
```

`POST /api/fulfilment-comparison` accepts the same shipment details plus a current warehouse and optional user-supplied costs:

```json
{
  "currentWarehouse": {
    "pickupPincode": "400001",
    "costs": {
      "gstTreatment": "inclusive"
    }
  },
  "deliveryPincode": "800001",
  "shipment": {
    "weightKg": 0.5,
    "paymentMode": "prepaid"
  },
  "monthlyOrderVolume": 100
}
```

The values above are request-shape examples, not Logistra rates. Add numeric cost inputs only when they are known for the current warehouse. Do not use zero unless the business has confirmed that a cost is genuinely zero.

## Response and limitations

Responses distinguish `available`, `unavailable`, and `not-configured` scenarios. They include the quote timestamp, whether an in-memory cached quote was used, the returned courier fields, the source of each cost line, missing costs, and whether a total is complete.

Shipping-only values are based on fields returned by Shiprocket's serviceability response. They are not delivery guarantees or final invoices. COD and additional charges are kept separate where returned. RTO charges are not allocated into a per-order total without a supplied return assumption.

Courier transit estimates begin after dispatch. Inventory must already be available at the relevant facility; replenishment, receiving, storage, and transfer time are separate commercial and operational considerations.

## Deployment

The project can deploy the route handlers with a Next.js server-capable deployment such as Vercel. The current rate-result and token caches are in-memory and therefore best-effort per running instance. A serverless cold start or a different deployment instance may authenticate again. If the application scales across multiple instances and cross-instance reuse is required, move token storage to an approved encrypted shared store; never put the bearer token in browser code, logs, or a public database.

Before enabling live public comparisons, confirm:

1. The dedicated Shiprocket API user works and has the required serviceability access.
2. The configured Logistra facility and origin PIN code are operationally verified.
3. Public display of the returned rate fields is permitted by the applicable account and commercial terms.
4. The Logistra pricing JSON contains only approved current fees and a confirmed GST treatment.
5. The comparison has been checked against representative shipment profiles.

The code does not create orders, book shipments, accept arbitrary provider URLs, or expose credentials.
