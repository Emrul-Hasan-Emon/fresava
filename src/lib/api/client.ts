import type { AccountType } from "@shared/contracts";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const refreshes = new Map<string, Promise<Response>>();
export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    kind?: AccountType;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal: options.signal,
  };
  if (options.body instanceof FormData) init.body = options.body;
  else if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
    init.headers = { "Content-Type": "application/json" };
  }
  let response = await fetch(`/api/v1/${path}`, init);
  if (response.status === 401 && !path.includes("/auth/") && options.kind) {
    const prefix = options.kind === "customer" ? "customers" : options.kind;
    let pending = refreshes.get(prefix);
    if (!pending) {
      pending = fetch(`/api/v1/${prefix}/auth/refresh`, {
        method: "POST",
        credentials: "same-origin",
      }).finally(() => refreshes.delete(prefix));
      refreshes.set(prefix, pending);
    }
    if ((await pending).ok) response = await fetch(`/api/v1/${path}`, init);
  }
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(response.status, data.error ?? "Request failed.");
  return data as T;
}
