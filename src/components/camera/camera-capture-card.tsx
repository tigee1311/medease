"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type CameraState = "idle" | "requesting" | "ready" | "blocked" | "captured";

export function CameraCaptureCard({
  medicationName,
  instructions,
}: {
  medicationName: string;
  instructions: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [preview, setPreview] = useState<string | null>(null);

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
      return;
    }

    try {
      setCameraState("requesting");
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
  }

  function resetCapture() {
    setPreview(null);
    setCameraState(streamRef.current ? "ready" : "idle");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setCameraState("captured");
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
            <label className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950">
              Upload photo
              <input accept="image/*" className="hidden" onChange={handleFileChange} type="file" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
