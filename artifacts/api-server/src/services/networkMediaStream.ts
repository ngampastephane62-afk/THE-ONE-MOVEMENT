type MediaStreamRequest = {
  headers: { range?: string };
  log: { error: (fields: Record<string, unknown>, message: string) => void };
};

type MediaStreamResponse = {
  headersSent: boolean;
  destroyed: boolean;
  writableEnded: boolean;
  status: (code: number) => MediaStreamResponse;
  end: () => void;
  destroy: () => void;
};

/**
 * Keep upstream storage failures distinguishable from successful, complete
 * media responses. Once headers are sent, destroy the response so the browser
 * can detect a truncated range instead of receiving a clean-looking 206.
 */
export function handleNetworkMediaStreamError(
  req: MediaStreamRequest,
  res: MediaStreamResponse,
  error: unknown,
) {
  if (res.destroyed || res.writableEnded) return;

  const errorCode =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "UNKNOWN")
      : "UNKNOWN";
  req.log.error(
    { storageErrorCode: errorCode, rangeRequested: Boolean(req.headers.range) },
    "Network media storage stream failed",
  );

  if (!res.headersSent) {
    res.status(502).end();
    return;
  }

  res.destroy();
}
