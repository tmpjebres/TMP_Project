type UnknownError = unknown;

const PAUSED_KEYWORDS = ['paused', 'project is paused', 'project_paused'];
const NETWORK_ERROR_MESSAGES = ['fetch failed', 'failed to fetch', 'network request failed', 'load failed'];
const PAUSED_STATUS_CODES = [503, 521, 522, 523];

function extractMessage(err: UnknownError): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message ?? '';
  if (typeof err === 'object') {
    const anyErr = err as Record<string, unknown>;
    return String(anyErr.message ?? anyErr.error_description ?? anyErr.error ?? '');
  }
  return '';
}

function extractStatus(err: UnknownError): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const anyErr = err as Record<string, unknown>;
  const status = anyErr.status ?? anyErr.statusCode ?? anyErr.code;
  const parsed = typeof status === 'string' ? parseInt(status, 10) : (status as number | undefined);
  return typeof parsed === 'number' && !Number.isNaN(parsed) ? parsed : undefined;
}

export function isSupabasePausedError(err: UnknownError): boolean {
  const message = extractMessage(err).toLowerCase();
  const status = extractStatus(err);

  if (PAUSED_KEYWORDS.some((kw) => message.includes(kw))) return true;
  if (status !== undefined && PAUSED_STATUS_CODES.includes(status)) return true;
  if (NETWORK_ERROR_MESSAGES.some((kw) => message.includes(kw))) return true;

  return false;
}
