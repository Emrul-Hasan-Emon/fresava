"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { button, secondary, Message } from "@/features/ui";
export function Scanner({
  onScan,
}: {
  onScan: (value: string) => void | Promise<void>;
}) {
  const rawId = useId(),
    id = `scanner-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`,
    ref = useRef<Html5Qrcode | null>(null),
    busy = useRef(false),
    alive = useRef(true);
  const [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [running, setRunning] = useState(false);
  async function stop() {
    const scanner = ref.current;
    ref.current = null;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {}
      try {
        scanner.clear();
      } catch {}
    }
    if (alive.current) setRunning(false);
  }
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      const scanner = ref.current;
      ref.current = null;
      if (scanner)
        void scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
    };
  }, []);
  async function start() {
    if (busy.current || ref.current) return;
    busy.current = true;
    setError("");
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } =
        await import("html5-qrcode");
      if (!alive.current) return;
      const scanner = new Html5Qrcode(id, {
        formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128],
        verbose: false,
      });
      ref.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 120 } },
        async (value) => {
          if (busy.current) return;
          busy.current = true;
          setCode(value);
          await stop();
          try {
            await onScan(value);
          } finally {
            busy.current = false;
          }
        },
        () => {},
      );
      if (!alive.current) {
        await stop();
        return;
      }
      setRunning(true);
    } catch {
      setError(
        "Camera could not start. Allow camera access, use a hardware scanner, or type the tracking code.",
      );
      await stop();
    } finally {
      busy.current = false;
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button className={secondary} onClick={start} disabled={running}>
          Use camera
        </button>
        {running && (
          <button className={secondary} onClick={stop}>
            Stop camera
          </button>
        )}
      </div>
      <div id={id} className="my-4 max-w-lg overflow-hidden rounded-2xl" />
      <form
        className="flex flex-wrap gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await stop();
          await onScan(code.trim());
        }}
      >
        <label className="flex-1 text-sm">
          Tracking code
          <input
            required
            maxLength={80}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Scan or type FRT…"
            className="mt-2 block w-full rounded-xl border p-3"
          />
        </label>
        <button className={`${button} self-end`}>Find shipment</button>
      </form>
      <Message error>{error}</Message>
    </div>
  );
}
