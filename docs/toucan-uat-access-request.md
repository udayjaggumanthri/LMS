# Mail to Toucan — Prajnadhara UAT only

WhatsApp already said the shared URLs are updated and the IP is whitelisted. Checked on our side: the callback answers, and both return pages load. The test card and test UPI are still not shared. Send only the mail below.

Subject: Prajnadhara UAT — please confirm the whitelist and share the test card and UPI

Hi team,

On WhatsApp we were told that the URLs below are updated, and that the IP address 103.135.230.249 is already whitelisted. Please confirm the same here.

IP address: 103.135.230.249

Callback URL: https://uat.prajnadharaedu.com/api/payments/toucan/callback/

Success URL: https://uat.prajnadharaedu.com/order-confirmation

Failure URL: https://uat.prajnadharaedu.com/checkout?status=failed

We checked these on our side. The callback URL is reachable, and the success and failure pages open.

Please share the test details we should use after the payment gateway page opens:

1. Test card number, expiry, CVV, and name on card.
2. Test UPI ID.
3. How a successful card payment should look, and how a successful UPI payment should look.
4. Whether the ICICI PAY TEST button on the page completes a test payment and then calls our callback URL.

Thank you.
Uday
