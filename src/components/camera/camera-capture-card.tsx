"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type CameraState = "idle" | "requesting" | "ready" | "blocked" | "captured";
type VerificationState = {
  result: "VERIFIED" | "REVIEW" | "MISMATCH";
  confidence: number;
  explanation: string;
  verificationLabel: string;
  source: string;
};

export function CameraCaptureCard({
  demoModeEnabled,
  prescriptionId,
  medicationName,
  instructions,
}: {
  demoModeEnabled: boolean;
  prescriptionId: string;
  medicationName: string;
  instructions: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [verifyPending, setVerifyPending] = useState(false);
  const [logPending, setLogPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const helperCopy = useMemo(() => {
    switch (cameraState) {
      case "requesting":
        return "Requesting camera access...";
      case "ready":
        return "Frame the medication label clearly, then capture.";
      case "blocked":
        return "Camera access is unavailable. Use the upload fallback or demo mode.";
      case "captured":
        return "Capture complete. The next step will verify this image.";
      default:
        return "Use your camera for a quick confirmation or upload a photo if needed.";
    }
  }, [cameraState]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("blocked");
      setStatusMessage(null);
      return;
    }

    try {
      setCameraState("requesting");
      setStatusMessage(null);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraState("ready");
    } catch {
      setCameraState("blocked");
    }
  }

  function captureFrame() {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);
    setCameraState("captured");
    setStatusMessage(null);
  }

  function resetCapture() {
    setPreview(null);
    setCameraState(streamRef.current ? "ready" : "idle");
    setVerification(null);
    setError(null);
    setStatusMessage(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setCameraState("captured");
    setVerification(null);
    setError(null);
    setStatusMessage(null);
  }

  async function runVerification() {
    if (!preview) {
      setError("Capture or upload an image before verifying.");
      setStatusMessage(null);
      return;
    }

    setVerifyPending(true);
    setError(null);
    setStatusMessage(null);

    const response = await fetch("/api/verification/mock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prescriptionId,
        imageData: preview,
      }),
    });

    const payload = (await response.json()) as VerificationState & { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to verify this image.");
      setVerifyPending(false);
      return;
    }

    setVerification(payload);
    setVerifyPending(false);
  }

  function simulateVerification(
    scenario: "correct" | "wrong"
  ) {
    setError(null);
    setStatusMessage(null);
    setCameraState("captured");
    setPreview(null);

    if (scenario === "correct") {
      setVerification({
        result: "VERIFIED",
        confidence: 98,
        explanation: "Demo mode instantly matched the medication to the active prescription.",
        verificationLabel: "Ready to log",
        source: "demo",
      });
      return;
    }

    setVerification({
      result: "MISMATCH",
      confidence: 31,
      explanation: "Demo mode detected packaging that does not match the expected medication.",
      verificationLabel: "Possible mismatch",
      source: "demo",
    });
  }

  async function logMedicationEvent(status: "TAKEN" | "MISSED" | "NEEDS_REVIEW") {
    setLogPending(true);
    setError(null);

    const response = await fetch("/api/medication-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prescriptionId,
        status,
        source: verification?.source === "demo" ? "DEMO" : verification ? "CAMERA" : "MANUAL",
        verification: verification ?? undefined,
      }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to log this event.");
      setLogPending(false);
      return;
    }

    setLogPending(false);
    setError(null);
    setStatusMessage(status === "MISSED" ? "Dose marked as missed. Timeline updated." : "Dose logged. Timeline updated.");
  }

  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_16px_50px_rgba(87,68,48,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Camera capture</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{medicationName}</h3>
          <p className="mt-2 text-sm leading-7 text-stone-600">{instructions}</p>
        </div>
        <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
          {cameraState}
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-950">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={`${medicationName} preview`} className="aspect-[4/3] h-full w-full object-cover" src={preview} />
          ) : (
            <video
              autoPlay
              className="aspect-[4/3] h-full w-full object-cover"
              muted
              playsInline
              ref={videoRef}
            />
          )}
          <canvas className="hidden" ref={canvasRef} />
        </div>
        <div className="flex flex-col justify-between rounded-[1.5rem] bg-stone-50 p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Guidance</p>
            <p className="mt-3 text-base leading-7 text-stone-700">{helperCopy}</p>
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-stone-600">
              Good capture tips: keep the bottle upright, use natural light, and fill most of the frame with the label or blister pack.
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              onClick={startCamera}
              type="button"
            >
              Start camera
            </button>
            <button
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
              onClick={captureFrame}
              type="button"
            >
              Capture
            </button>
            <button
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
              onClick={resetCapture}
              type="button"
            >
              Reset
            </button>
            <button
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              onClick={runVerification}
              type="button"
            >
              {verifyPending ? "Verifying..." : "Verify capture"}
            </button>
            <label className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950">
              Upload photo
              <input accept="image/*" className="hidden" onChange={handleFileChange} type="file" />
            </label>
          </div>
          {demoModeEnabled ? (
            <div className="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-800">
                Demo mode shortcuts
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  onClick={() => simulateVerification("correct")}
                  type="button"
                >
                  Simulate Correct Medication
                </button>
                <button
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                  onClick={() => simulateVerification("wrong")}
                  type="button"
                >
                  Simulate Wrong Medication
                </button>
                <button
                  className="rounded-full border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
                  onClick={() => logMedicationEvent("MISSED")}
                  type="button"
                >
                  Simulate Missed Dose
                </button>
              </div>
            </div>
          ) : null}
          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          {statusMessage ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p> : null}
          {verification ? (
            <div className="mt-4 rounded-[1.5rem] bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white ${
                    verification.result === "VERIFIED"
                      ? "bg-emerald-600"
                      : verification.result === "REVIEW"
                        ? "bg-amber-500"
                        : "bg-rose-600"
                  }`}
                >
                  {verification.result}
                </span>
                <span className="text-sm font-semibold text-stone-700">{verification.confidence}% confidence</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200">
                <div
                  className={`h-full rounded-full ${
                    verification.result === "VERIFIED"
                      ? "bg-emerald-500"
                      : verification.result === "REVIEW"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${verification.confidence}%` }}
                />
              </div>
              <p className="mt-3 text-base font-semibold text-stone-900">{verification.verificationLabel}</p>
              <p className="mt-2 text-sm leading-7 text-stone-600">{verification.explanation}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
                  onClick={() => logMedicationEvent(verification.result === "VERIFIED" ? "TAKEN" : "NEEDS_REVIEW")}
                  type="button"
                >
                  {logPending ? "Logging..." : "Log event"}
                </button>
                <button
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                  onClick={() => logMedicationEvent("MISSED")}
                  type="button"
                >
                  Mark missed
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
