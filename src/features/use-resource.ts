"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { AccountType } from "@shared/contracts";
export function useResource<T>(path: string, kind: AccountType) {
  const [version, setVersion] = useState(0);
  const key = `${kind}:${path}:${version}`;
  const [result, setResult] = useState<{
    key: string;
    data: T | null;
    error: string;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    api<T>(path, { kind, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data, error: "" });
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setResult({ key, data: null, error: e.message });
      });
    return () => controller.abort();
  }, [path, kind, key]);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const current = result?.key === key ? result : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? "",
    loading: !current,
    reload,
  };
}
