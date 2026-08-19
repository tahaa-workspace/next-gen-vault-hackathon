export function success(data = {}, message = 'OK') {
  return { success: true, message, data };
}

export function fail(message = 'Request failed', details = null) {
  const body = { success: false, message };
  if (details) body.details = details;
  return body;
}

export function isValidObjectId(id) {
  if (!id) return false;
  return /^[a-fA-F0-9]{24}$/.test(String(id));
}
