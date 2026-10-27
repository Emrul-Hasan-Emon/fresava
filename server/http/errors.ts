export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function databaseError(
  error: { message: string; code?: string } | null,
) {
  if (!error) return;
  const safe = [
    "Invalid cart",
    "Invalid promo",
    "Product unavailable",
    "Invalid zone",
    "Order not found",
    "Order changed; scan again",
    "Order already delivered",
    "Order already cancelled",
    "Invalid reason",
    "Invalid quantity",
    "Batch not found",
    "Batch already processed",
    "Order can no longer be cancelled",
    "Feedback requires delivery",
    "Feedback already submitted",
    "Idempotency key conflict",
    "Not authorized",
  ];
  if (safe.includes(error.message))
    throw new HttpError(
      error.message === "Not authorized" ? 403 : 409,
      error.message,
    );
  throw new HttpError(
    503,
    "The request could not be completed. Please try again.",
  );
}
