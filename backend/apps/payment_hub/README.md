# Payment hub

The hub is a Django app inside the LMS process. It does not enroll students and it does not credit an mPayHub wallet. Each caller is a `PaymentApplication` row.

## Who owns which step

LMS owns course selection, coupons, the duplicate-enrollment check, `Order` / `OrderItem`, enrollment, the receipt email, and `/order-confirmation`.

The hub owns the Toucan session, the amount hash, the status poll, callback parsing, `HubTransaction`, and delivery to the registered `result_endpoint`.

mPayHub owns packages, fees, the wallet, commissions, and `/reports/payin`. Its Toucan client stays off until that registry row is enabled, its provider profile is approved, and `PAYMENT_HUB_TOUCAN_ENABLED` is turned on in the mPayHub process. Razorpay remains the live pay-in path.

## File map

- `models.py` — `ProviderProfile`, `PaymentApplication`, `ApplicationCredential`, `HubTransaction`, `CallbackEvent`, `ApplicationDelivery`
- `providers/toucan.py` — hash, invoice, checkout form, status poll, invoice extraction
- `services.py` — create, status, cancel, callback, signed delivery
- `authentication.py` — Bearer key plus HMAC
- `bootstrap.py` — initial registry rows and optional refresh from Payment Gateway settings
- `views.py` — `/api/v1/payments` and the admin registry
- `apps/orders/hub_connector.py` — LMS calls the hub with its own credential
- `apps/orders/fulfillment.py` — enrollment and receipt, outside the Toucan adapter

## Contract

`POST /api/v1/payments` with `Authorization: Bearer <api key>`, `X-Hub-Timestamp`, and `X-Hub-Signature` (HMAC-SHA256 of `timestamp + '.' + raw body`). The hub sets `application_id` from the credential. A body field named `application_id`, and any return URL on the request, are ignored.

Toucan still posts to `POST /api/payments/toucan/callback/`. The handler loads the transaction by the stored invoice and posts one signed result to that row's `result_endpoint`.

Set `PAYMENT_HUB_ENABLED=false` to use the previous in-process Toucan path for one release.

`whitelisted_ip` on the provider profile is the server address registered with Toucan for outbound calls. Inbound callback filtering uses `callback_ip_allowlist` only when that field is filled, so a saved server IP cannot reject Toucan's callback by mistake.
