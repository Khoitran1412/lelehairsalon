/**
 * LeLe Hair Design — booking confirmation companion patch
 *
 * This file is intentionally NOT a replacement for the currently working
 * Google Apps Script doPost. Add these helpers to the existing bound Sheet
 * script, then make the small insertion described in
 * docs/BOOKING_NOTIFICATIONS_SETUP.md.
 *
 * No secret, endpoint, or phone number belongs in this source file.
 */

const BOOKING_CONFIRMATION_HEADERS = [
  'booking_reference',
  'notification_consent',
  'booking_status',
  'received_notification_status',
  'confirmed_notification_status',
  'confirmed_notification_sent_at',
  'notification_error',
];

const SCRIPT_PROPERTIES = {
  approvalUrl: 'BOOKING_APPROVAL_WEBHOOK_URL',
  webhookSecret: 'BOOKING_APPROVAL_WEBHOOK_SECRET',
  authorisedEditors: 'BOOKING_APPROVAL_AUTHORISED_EDITORS',
  sheetName: 'BOOKING_SHEET_NAME',
};

const NOTIFICATION_RESULT_MAX_AGE_MS = 5 * 60 * 1000;

// Map these aliases to the actual headers already used in the working Sheet.
// The current booking fields remain untouched; only the seven new headers are
// added if they are absent.
const BOOKING_FIELD_ALIASES = {
  fullName: ['fullName', 'full_name', 'Họ và tên', 'Tên khách hàng'],
  phone: ['phone', 'phone_number', 'Số điện thoại'],
  bookingDate: ['bookingDate', 'booking_date', 'Ngày mong muốn'],
  bookingTime: ['bookingTime', 'booking_time', 'Giờ mong muốn'],
  service: ['service', 'Dịch vụ'],
  language: ['language', 'Ngôn ngữ'],
};

/**
 * Call this after the existing booking logic has appended its row. It never
 * alters the legacy booking values or the existing response contract.
 *
 * Example insertion in the existing doPost(e), after appendRow()/setValues():
 *
 *   const row = sheet.getLastRow();
 *   writeBookingConfirmationMetadata_(sheet, row, e.parameter);
 */
function writeBookingConfirmationMetadata_(sheet, row, parameters) {
  const columns = ensureBookingConfirmationColumns_(sheet);
  const metadata = {
    booking_reference: String(parameters.booking_reference || '').trim(),
    notification_consent: String(parameters.notification_consent) === 'true',
    booking_status: 'PENDING',
    received_notification_status: String(parameters.notification_consent) === 'true' ? 'PENDING_PROVIDER' : 'NOT_REQUESTED',
    confirmed_notification_status: 'NOT_REQUESTED',
    confirmed_notification_sent_at: '',
    notification_error: '',
  };

  Object.keys(metadata).forEach((header) => {
    sheet.getRange(row, columns[header]).setValue(metadata[header]);
  });
}

/**
 * Add this at the very beginning of the existing doPost(e), before its normal
 * booking logic:
 *
 *   const callback = maybeHandleReceivedNotificationResult_(e);
 *   if (callback) return callback;
 *
 * The callback body contains its own signed payload because Apps Script web
 * apps do not reliably expose inbound HTTP headers to doPost(e).
 */
function maybeHandleReceivedNotificationResult_(event) {
  const outerRawBody = event && event.postData ? String(event.postData.contents || '') : '';
  if (!outerRawBody) return null;

  let envelope;
  try {
    envelope = JSON.parse(outerRawBody);
  } catch (_error) {
    return null; // This is the established form-urlencoded booking request.
  }

  if (!envelope || typeof envelope.rawNotification !== 'string') return null;

  let notification;
  try {
    notification = JSON.parse(envelope.rawNotification);
  } catch (_error) {
    return jsonResponse_({ success: false, message: 'Invalid notification callback.' });
  }

  if (!notification || notification.action !== 'record_received_notification_result') return null;
  if (!isFreshSignedNotificationResult_(envelope)) {
    return jsonResponse_({ success: false, message: 'Unauthorised notification callback.' });
  }

  const bookingReference = String(notification.bookingReference || '').trim();
  if (!bookingReference) return jsonResponse_({ success: false, message: 'Missing booking reference.' });

  const sheet = getBookingSheet_();
  const columns = ensureBookingConfirmationColumns_(sheet);
  const row = findBookingRowByReference_(sheet, columns.booking_reference, bookingReference);
  if (!row) return jsonResponse_({ success: false, message: 'Booking reference was not found.' });

  const channels = notification.notification && Array.isArray(notification.notification.channels)
    ? notification.notification.channels
    : [];
  const summary = channels.map((channel) => `${String(channel.channel || '').toUpperCase()}: ${String(channel.outcome || '').toUpperCase()}`).join('; ');
  const errors = channels
    .filter((channel) => channel.outcome === 'failed' || channel.outcome === 'unknown')
    .map((channel) => `${String(channel.channel || '').toUpperCase()}: ${String(channel.reason || 'provider failure')}`)
    .join('; ');

  sheet.getRange(row, columns.received_notification_status).setValue(summary || 'PROCESSED');
  if (errors) setNotificationError_(sheet, row, columns, errors);
  return jsonResponse_({ success: true });
}

function isFreshSignedNotificationResult_(envelope) {
  const timestamp = String(envelope.timestamp || '');
  const signature = String(envelope.signature || '');
  const rawNotification = String(envelope.rawNotification || '');
  const timestampMs = Number(timestamp);
  if (!Number.isSafeInteger(timestampMs) || Math.abs(Date.now() - timestampMs) > NOTIFICATION_RESULT_MAX_AGE_MS) return false;

  const secret = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTIES.webhookSecret);
  if (!secret || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  return constantTimeEqualHex_(hmacSha256Hex_(`${timestamp}.${rawNotification}`, secret), signature.toLowerCase());
}

function constantTimeEqualHex_(left, right) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function getBookingSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTIES.sheetName);
  const sheet = sheetName ? spreadsheet.getSheetByName(sheetName) : spreadsheet.getActiveSheet();
  if (!sheet) throw new Error('Booking sheet was not found.');
  return sheet;
}

function findBookingRowByReference_(sheet, column, bookingReference) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const range = sheet.getRange(2, column, lastRow - 1, 1);
  const match = range.createTextFinder(bookingReference).matchEntireCell(true).findNext();
  return match ? match.getRow() : 0;
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

/** Adds missing headers at the end of row 1 without moving existing columns. */
function ensureBookingConfirmationColumns_(sheet) {
  const headerRow = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const columns = indexHeaders_(headerRow);
  let nextColumn = headerRow.length + 1;

  BOOKING_CONFIRMATION_HEADERS.forEach((header) => {
    if (columns[header]) return;
    sheet.getRange(1, nextColumn).setValue(header);
    columns[header] = nextColumn;
    nextColumn += 1;
  });

  return columns;
}

function indexHeaders_(headers) {
  return headers.reduce((columns, header, index) => {
    const value = String(header || '').trim();
    if (value) columns[value] = index + 1;
    return columns;
  }, {});
}

function findFieldColumn_(columns, aliases) {
  return aliases.map((alias) => columns[alias]).find((column) => Boolean(column)) || 0;
}

function readBookingField_(sheet, row, columns, fieldName) {
  const column = findFieldColumn_(columns, BOOKING_FIELD_ALIASES[fieldName]);
  return column ? String(sheet.getRange(row, column).getDisplayValue() || '').trim() : '';
}

/**
 * Install this as an installable spreadsheet "On edit" trigger. Protect the
 * booking_status column so only authorised staff can enter CONFIRMED.
 */
function onBookingStatusEdit(event) {
  if (!event || !event.range || event.range.getRow() === 1) return;

  const sheet = event.range.getSheet();
  const columns = ensureBookingConfirmationColumns_(sheet);
  if (event.range.getColumn() !== columns.booking_status) return;
  if (String(event.value || '').trim().toUpperCase() !== 'CONFIRMED') return;
  if (!isAuthorisedEditor_(event)) return;

  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10_000)) throw new Error('Could not obtain booking confirmation lock.');

  try {
    const row = event.range.getRow();
    const currentStatus = String(sheet.getRange(row, columns.booking_status).getDisplayValue() || '').trim().toUpperCase();
    if (currentStatus !== 'CONFIRMED') return;

    const existingAttempt = String(sheet.getRange(row, columns.confirmed_notification_status).getDisplayValue() || '').trim();
    const existingSentAt = sheet.getRange(row, columns.confirmed_notification_sent_at).getValue();
    if (existingAttempt === 'SENDING' || existingAttempt === 'SENT' || existingSentAt) return;

    const bookingReference = String(sheet.getRange(row, columns.booking_reference).getDisplayValue() || '').trim();
    if (!bookingReference) {
      setNotificationError_(sheet, row, columns, 'Missing booking_reference; confirmation webhook was not sent.');
      return;
    }

    // Persist a claim in the Sheet before external I/O. Combined with the
    // Worker Durable Object, this prevents trigger re-entry and webhook replay.
    sheet.getRange(row, columns.confirmed_notification_status).setValue('SENDING');
    sheet.getRange(row, columns.notification_error).setValue('');
    SpreadsheetApp.flush();

    const payload = {
      bookingReference,
      fullName: readBookingField_(sheet, row, columns, 'fullName'),
      phone: readBookingField_(sheet, row, columns, 'phone'),
      bookingDate: readBookingField_(sheet, row, columns, 'bookingDate'),
      bookingTime: readBookingField_(sheet, row, columns, 'bookingTime'),
      service: readBookingField_(sheet, row, columns, 'service'),
      language: readBookingField_(sheet, row, columns, 'language') === 'vi' ? 'vi' : 'en',
      notificationConsent: String(sheet.getRange(row, columns.notification_consent).getValue()) === 'true',
    };

    if (!payload.fullName || !payload.phone || !payload.bookingDate || !payload.bookingTime || !payload.service) {
      setNotificationError_(sheet, row, columns, 'Missing booking details; confirmation webhook was not sent.');
      sheet.getRange(row, columns.confirmed_notification_status).setValue('FAILED');
      return;
    }

    const response = postSignedApproval_(payload);
    writeConfirmationNotificationResult_(sheet, row, columns, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Approval webhook failed.';
    const currentColumns = ensureBookingConfirmationColumns_(sheet);
    sheet.getRange(event.range.getRow(), currentColumns.confirmed_notification_status).setValue('FAILED');
    setNotificationError_(sheet, event.range.getRow(), currentColumns, message);
  } finally {
    lock.releaseLock();
  }
}

function isAuthorisedEditor_(event) {
  const configuredEditors = String(PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTIES.authorisedEditors) || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  // e.user may be unavailable for some Google Workspace setups. In that case,
  // the protected Sheet column remains the mandatory authorisation control.
  if (!configuredEditors.length) return true;
  const editor = event.user && event.user.getEmail ? String(event.user.getEmail() || '').toLowerCase() : '';
  return Boolean(editor && configuredEditors.includes(editor));
}

function postSignedApproval_(payload) {
  const properties = PropertiesService.getScriptProperties();
  const endpoint = properties.getProperty(SCRIPT_PROPERTIES.approvalUrl);
  const secret = properties.getProperty(SCRIPT_PROPERTIES.webhookSecret);
  if (!endpoint || !secret) throw new Error('Missing approval webhook Script Properties.');

  const timestamp = String(Date.now());
  const rawBody = JSON.stringify(payload);
  const signature = hmacSha256Hex_(`${timestamp}.${rawBody}`, secret);
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: rawBody,
    headers: {
      'X-LeLe-Timestamp': timestamp,
      'X-LeLe-Signature': signature,
    },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    throw new Error(`Approval webhook returned HTTP ${response.getResponseCode()}.`);
  }

  try {
    return JSON.parse(response.getContentText());
  } catch (_error) {
    throw new Error('Approval webhook returned invalid JSON.');
  }
}

function hmacSha256Hex_(value, secret) {
  return Utilities.computeHmacSha256Signature(value, secret)
    .map((byte) => ((byte + 256) % 256).toString(16).padStart(2, '0'))
    .join('');
}

function writeConfirmationNotificationResult_(sheet, row, columns, response) {
  if (response.duplicate === true) {
    sheet.getRange(row, columns.confirmed_notification_status).setValue('DUPLICATE_IGNORED');
    return;
  }

  const channels = response.notification && Array.isArray(response.notification.channels) ? response.notification.channels : [];
  const summary = channels.map((channel) => `${String(channel.channel || '').toUpperCase()}: ${String(channel.outcome || '').toUpperCase()}`).join('; ');
  const errors = channels
    .filter((channel) => channel.outcome === 'failed' || channel.outcome === 'unknown')
    .map((channel) => `${String(channel.channel || '').toUpperCase()}: ${String(channel.reason || 'provider failure')}`)
    .join('; ');

  sheet.getRange(row, columns.confirmed_notification_status).setValue(summary || 'SENT');
  sheet.getRange(row, columns.confirmed_notification_sent_at).setValue(new Date());
  sheet.getRange(row, columns.notification_error).setValue(errors);
}

function setNotificationError_(sheet, row, columns, message) {
  sheet.getRange(row, columns.notification_error).setValue(String(message || '').slice(0, 500));
}
