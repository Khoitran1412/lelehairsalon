# Booking confirmations and notifications

This repository now ships the website confirmation flow and a **disabled-by-default** Twilio framework. It does not modify the live Google Apps Script, Google Sheet, Twilio account, Cloudflare secrets, or Netlify project.

## What is active after the website deploy

- A customer sees a reference such as `LELE-20260828-AB12CD34` only after the existing Google Apps Script reports `{ "success": true }`.
- The original Apps Script fields and URL-encoded submission format are preserved: `fullName`, `phone`, `bookingDate`, `bookingTime`, `service`, `note`, `language`, and `sourcePage`.
- The website additionally submits `booking_reference`, `notification_consent`, and `booking_status=PENDING`. Older scripts can ignore those additive fields without breaking the existing booking submission.
- Messaging remains off until a Cloudflare administrator sets `MESSAGING_ENABLED` to the literal `true` and configures the required secrets.

## Add the Sheet fields without replacing the working script

1. Open the Google Sheet that receives the bookings, then open its bound Apps Script project.
2. Copy the helpers from [google-apps-script-booking-confirmation.gs](google-apps-script-booking-confirmation.gs) into the existing project. Do not overwrite its working `doPost` function.
3. At the very beginning of the existing `doPost(e)`, add the signed callback guard below so the Worker can later record received SMS/WhatsApp outcomes without creating a duplicate booking row:

   ```javascript
   const callback = maybeHandleReceivedNotificationResult_(e);
   if (callback) return callback;
   ```

   Immediately after its normal code has written a booking row, add this one call using the actual destination `sheet` and newly written `row`:

   ```javascript
   writeBookingConfirmationMetadata_(sheet, row, e.parameter);
   ```

   Keep the script's existing response unchanged: it must still return JSON containing `success: true` for a successful booking.
4. Run `ensureBookingConfirmationColumns_(yourSheet)` once from the Apps Script editor, or submit a test booking after adding the call. This appends—without moving existing columns—the following fields:

   - `booking_reference`
   - `notification_consent`
   - `booking_status`
   - `received_notification_status`
   - `confirmed_notification_status`
   - `confirmed_notification_sent_at`
   - `notification_error`

   New rows are written as `PENDING`. Consent is stored as a boolean; a booking without consent is valid and is marked `NOT_REQUESTED` for received messaging.
5. Check `BOOKING_FIELD_ALIASES` in the companion script. Add the precise header names from the existing sheet if its current fields differ from the documented aliases.

## Install the protected confirmation trigger

1. In the Sheet, protect the `booking_status` column. Grant edit access only to staff authorised to confirm appointments.
2. In Apps Script, open **Triggers** → **Add Trigger**.
3. Select `onBookingStatusEdit`, event source **From spreadsheet**, event type **On edit**, then save. This must be an installable trigger so it has authority to call the server.
4. In **Project Settings** → **Script Properties**, create the following names. Enter values in the Google UI only; do not put them in code, Git, email, or this document.

   | Script Property | Purpose |
   | --- | --- |
   | `BOOKING_APPROVAL_WEBHOOK_URL` | Production URL ending in `/api/booking/approval` |
   | `BOOKING_APPROVAL_WEBHOOK_SECRET` | Same secret stored in Cloudflare as `BOOKING_APPROVAL_WEBHOOK_SECRET` |
   | `BOOKING_APPROVAL_AUTHORISED_EDITORS` | Optional comma-separated staff emails; column protection remains required |
   | `BOOKING_SHEET_NAME` | Recommended exact tab name used for booking rows and receipt result updates |

5. Change one test booking from `PENDING` to `CONFIRMED`. The trigger uses `LockService`, writes `SENDING` before the call, and will not issue another confirmation for a row that already has a sent-at value or a `SENDING`/`SENT` state.

The trigger sends raw JSON only to the authenticated server endpoint. The Worker verifies an HMAC-SHA256 of `${timestamp}.${rawBody}`, accepts only a short timestamp window, and durably claims the booking before a provider can run. Replays return an idempotent success response and do not send another notification.

## Configure Cloudflare secrets when messaging is ready

Leave every secret unset for the present deployment. When the salon has an approved Twilio account and templates, set these **Cloudflare Worker secrets** in the dashboard (or through a secure CI secret workflow), never as `NEXT_PUBLIC_*` variables:

| Secret | Required for |
| --- | --- |
| `MESSAGING_ENABLED` | Set only to `true` to enable messaging |
| `TWILIO_ACCOUNT_SID` | Twilio API authentication |
| `TWILIO_AUTH_TOKEN` | Twilio API authentication |
| `TWILIO_SMS_FROM` | SMS sender |
| `TWILIO_WHATSAPP_FROM` | WhatsApp sender, with or without the `whatsapp:` prefix |
| `TWILIO_CONTENT_SID_RECEIVED` | Received WhatsApp Content Template SID |
| `TWILIO_CONTENT_SID_CONFIRMED` | Confirmed WhatsApp Content Template SID |
| `BOOKING_APPROVAL_WEBHOOK_SECRET` | HMAC secret shared only with Apps Script |
| `BOOKING_NOTIFICATION_RESULT_WEBHOOK_URL` | Optional Apps Script web-app URL for signed received-notification result updates |

`BOOKING_ENDPOINT` is an optional server-only replacement for the legacy `NEXT_PUBLIC_BOOKING_ENDPOINT`. The route continues to fall back to the legacy value so the current booking integration remains compatible.

## Twilio content preparation

Create and approve **one bilingual Unicode WhatsApp Content Template for each event**. The two SIDs above are intentionally the only content-SID variables, so each template should contain both language variants and use these variables:

| Variable | Value |
| --- | --- |
| `{{1}}` | Booking reference |
| `{{2}}` | Requested time |
| `{{3}}` | Requested date |
| `{{4}}` | Service |
| `{{5}}` | Customer language (`vi` or `en`) |

Received template:

```text
VI: LeLe Hair Design đã nhận yêu cầu đặt lịch {{1}} vào {{2}} {{3}}. Lịch hẹn chưa được xác nhận. Salon sẽ thông báo sau khi kiểm tra lịch.
EN: LeLe Hair Design has received your booking request {{1}} for {{2}} {{3}}. Your appointment is not confirmed yet. We will notify you after reviewing availability.
```

Confirmed template:

```text
VI: LeLe Hair Design xác nhận lịch hẹn {{1}} vào {{2}} {{3}}. Vui lòng đến đúng giờ.
EN: LeLe Hair Design has confirmed appointment {{1}} for {{2}} {{3}}. Please arrive on time.
```

The Worker sends SMS directly only with these bodies—no URLs or additional phone numbers are added:

```text
[LeLe Hair Design] Da nhan yeu cau dat lich {reference} vao {time} {date}. Lich chua duoc xac nhan. Salon se phan hoi som.
[LeLe Hair Design] Lich hen {reference} da duoc xac nhan vao {time} {date}. Vui long den dung gio.
```

Both SMS and WhatsApp are checked independently. They are only attempted when the customer submitted a strict `true` consent value and the number can be safely normalised to a Vietnamese E.164 mobile number, for example `0975489317` → `+84975489317`.

## Delivery safety and verification

- A Cloudflare Durable Object persists an attempt claim before each individual SMS or WhatsApp API call. This prevents duplicate sends on browser re-submission, trigger re-entry, or signed webhook replay.
- Twilio cannot provide a transactional exactly-once delivery guarantee if a process stops after Twilio accepts a request but before the response is persisted. The implementation therefore intentionally uses safe **at-most-once attempts**: ambiguous attempts are not automatically re-sent and should be reviewed by staff.
- Received and approval notification results are recorded independently. The signed receipt callback writes `received_notification_status`; the approval response writes `confirmed_notification_status`; either channel can be `SENT`, `FAILED`, `SKIPPED`, or `UNKNOWN` without blocking the other.
- Do not log raw phone numbers, Twilio tokens, approval signatures, or request bodies. The website logs only a masked number and non-sensitive reference/channel state.

Before setting `MESSAGING_ENABLED=true`, test in a copy of the Sheet with a test Twilio destination, verify the `PENDING → CONFIRMED` workflow, and confirm both approved WhatsApp templates in Twilio.
