"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DemoScenario = "correct" | "wrong" | "missed";

type ScenarioConfig = {
  title: string;
  actionLabel: string;
  resultLabel: string;
  confidence: number | null;
  description: string;
  banner?: string;
  bannerTone?: "warning" | "danger" | "success";
  eventStatus: "TAKEN" | "MISSED" | "NEEDS_REVIEW";
  source: "DEMO" | "MANUAL";
  verification?:
    | {
        result: "VERIFIED" | "REVIEW" | "MISMATCH";
        confidence: number;
        explanation: string;
        verificationLabel: string;
      }
    | undefined;
};

const scenarioConfigs: Record<DemoScenario, ScenarioConfig> = {
  correct: {
    title: "Simulate Correct Medication",
    actionLabel: "Correct medication",
    resultLabel: "Verified",
    confidence: 98,
    description:
      "The label matches the active prescription and the dose can be logged safely.",
    bannerTone: "success",
    eventStatus: "TAKEN",
    source: "DEMO",
    verification: {
      result: "VERIFIED",
      confidence: 98,
      explanation: "Demo mode verified the medication instantly against the prescription profile.",
      verificationLabel: "Ready to log",
    },
  },
  wrong: {
    title: "Simulate Wrong Medication",
    actionLabel: "Wrong medication",
    resultLabel: "Mismatch",
    confidence: 34,
    description:
      "The packaging does not match the expected medication, so the system stops the dose and raises an alert.",
    banner: "⚠️ This does not match your prescription",
    bannerTone: "danger",
    eventStatus: "NEEDS_REVIEW",
    source: "DEMO",
    verification: {
      result: "MISMATCH",
      confidence: 34,
      explanation: "Demo mode detected a mismatch between the captured packaging and the active prescription.",
      verificationLabel: "Possible mismatch",
    },
  },
  missed: {
    title: "Simulate Missed Dose",
    actionLabel: "Missed dose",
    resultLabel: "Missed",
    confidence: null,
    description:
      "The dose is logged as missed and the caregiver panel is updated so follow-up can happen quickly.",
    banner: "🚨 Caregiver has been notified",
    bannerTone: "danger",
    eventStatus: "MISSED",
    source: "MANUAL",
  },
};

function toneClasses(tone?: "warning" | "danger" | "success") {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "danger":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

export function DemoFlowPanel({
  caregiverEmail,
  demoModeEnabled,
  medicationName,
  nextDoseLabel,
  prescriptionId,
}: {
  caregiverEmail: string | null;
  demoModeEnabled: boolean;
  medicationName: string;
  nextDoseLabel: string;
  prescriptionId: string;
}) {
  const router = useRouter();
  const hasPrescription = Boolean(prescriptionId);
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null);
  const [step, setStep] = useState<"idle" | "scenario" | "result" | "complete">("idle");
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentScenario = activeScenario ? scenarioConfigs[activeScenario] : null;
  const wowTone =
    currentScenario?.bannerTone === "danger"
      ? "animate-shakeX"
      : currentScenario?.bannerTone === "success"
        ? "animate-successPulse"
        : "animate-slideFade";

  const confidenceWidth = useMemo(() => `${currentScenario?.confidence ?? 0}%`, [currentScenario]);

  function openDemoFlow() {
    if (!prescriptionId) {
      setStatusMessage("Add an active prescription before running the demo.");
      return;
    }

    if (!demoModeEnabled) {
      setStatusMessage("Turn demo mode on in the sidebar first for the instant demo flow.");
      return;
    }

    setStatusMessage(null);
    setStep("scenario");
  }

  function chooseScenario(scenario: DemoScenario) {
    setActiveScenario(scenario);
    setStatusMessage(null);
    setStep("result");
  }

  async function completeScenario() {
    if (!activeScenario || !currentScenario) {
      return;
    }

    setPending(true);
    const response = await fetch("/api/medication-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prescriptionId,
        status: currentScenario.eventStatus,
        source: currentScenario.source,
        verification: currentScenario.verification,
      }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatusMessage(payload.error ?? "Unable to complete the demo flow.");
      setPending(false);
      return;
    }

    setPending(false);
    setStep("complete");
    setStatusMessage(
      activeScenario === "correct"
        ? "Dose completed and dashboard updated."
        : activeScenario === "wrong"
          ? "Mismatch recorded and caregiver view updated."
          : "Missed dose recorded and caregiver notified."
    );

    startTransition(() => {
      router.refresh();
    });

    window.setTimeout(() => {
      setStep("idle");
      setActiveScenario(null);
    }, 1200);
  }

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_18px_60px_rgba(87,68,48,0.08)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-base font-semibold uppercase tracking-[0.24em] text-emerald-700">
            30-second demo flow
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Take Medication (Try Demo)
          </h2>
          <p className="mt-4 text-xl leading-9 text-stone-600">
            Show the full product loop in one moment: verify the dose, surface confidence, and update caregiver visibility.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4 text-base leading-8 text-stone-700">
          <p className="font-semibold text-stone-900">Ready now</p>
          <p>{medicationName}</p>
          <p className="text-stone-500">Next dose {nextDoseLabel}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(145deg,_#f7f4ef,_#ffffff)] p-6">
          {step === "idle" ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] bg-emerald-50 p-5 text-lg leading-8 text-emerald-900">
                {demoModeEnabled
                  ? "Demo mode is ON, so this flow skips the real camera and simulates the result instantly."
                  : "Turn demo mode on in the sidebar to skip the real camera for a smoother judged flow."}
              </div>
              <button
                className="h-20 w-full rounded-[1.75rem] bg-emerald-600 px-6 text-2xl font-semibold text-white shadow-[0_18px_40px_rgba(22,163,74,0.28)] transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                disabled={!hasPrescription}
                onClick={openDemoFlow}
                type="button"
              >
                Take Medication (Try Demo)
              </button>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Click once to open the guided flow.",
                  "Pick a success, mismatch, or missed-dose scenario.",
                  "Watch the dashboard and caregiver state update immediately.",
                ].map((item) => (
                  <div key={item} className="rounded-[1.25rem] bg-stone-50 p-4 text-base leading-7 text-stone-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === "scenario" ? (
            <div className="animate-slideFade space-y-5">
              <div>
                <p className="text-base font-semibold uppercase tracking-[0.22em] text-stone-500">Choose a demo outcome</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
                  Simulate one outcome with a single click.
                </h3>
              </div>
              <div className="grid gap-4">
                {(Object.keys(scenarioConfigs) as DemoScenario[]).map((scenario) => {
                  const config = scenarioConfigs[scenario];

                  return (
                    <button
                      key={scenario}
                      className={`rounded-[1.5rem] border px-5 py-5 text-left text-lg leading-8 transition ${toneClasses(config.bannerTone)}`}
                      onClick={() => chooseScenario(scenario)}
                      type="button"
                    >
                      <span className="block text-2xl font-semibold">{config.title}</span>
                      <span className="mt-2 block">{config.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === "result" && currentScenario ? (
            <div className={`${wowTone} space-y-5`}>
              <div className={`rounded-[1.5rem] border px-5 py-5 ${toneClasses(currentScenario.bannerTone)}`}>
                <p className="text-base font-semibold uppercase tracking-[0.22em]">Verification result</p>
                <h3 className="mt-3 text-4xl font-semibold tracking-tight">{currentScenario.resultLabel}</h3>
                <p className="mt-3 text-lg leading-8">{currentScenario.description}</p>
              </div>

              {currentScenario.confidence !== null ? (
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-stone-900">Confidence</p>
                    <p className="text-3xl font-semibold text-stone-900">{currentScenario.confidence}%</p>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full ${
                        currentScenario.bannerTone === "danger" ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: confidenceWidth }}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-stone-200 bg-amber-50 p-5 text-lg leading-8 text-amber-900">
                  Confidence is not applicable here because the dose is being recorded as missed rather than visually verified.
                </div>
              )}

              {currentScenario.banner ? (
                <div className={`rounded-[1.5rem] border px-5 py-4 text-xl font-semibold ${toneClasses(currentScenario.bannerTone)}`}>
                  {currentScenario.banner}
                </div>
              ) : null}

              <button
                className="h-18 w-full rounded-[1.5rem] bg-stone-900 px-6 text-xl font-semibold text-white transition hover:bg-stone-700"
                disabled={pending}
                onClick={completeScenario}
                type="button"
              >
                {pending ? "Completing..." : "Complete demo step"}
              </button>
            </div>
          ) : null}

          {step === "complete" ? (
            <div className="animate-successPulse rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-emerald-900">
              <p className="text-base font-semibold uppercase tracking-[0.22em]">Dashboard updated</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                Returning to the live dashboard state.
              </p>
            </div>
          ) : null}

          {statusMessage ? (
            <div className="mt-5 rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4 text-base leading-7 text-stone-700">
              {statusMessage}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-stone-200 bg-stone-900 p-6 text-stone-50">
            <p className="text-base font-semibold uppercase tracking-[0.22em] text-stone-300">Judge-friendly narrative</p>
            <div className="mt-4 space-y-4 text-lg leading-8 text-stone-100">
              <p>1. Open the main CTA.</p>
              <p>2. Simulate the outcome instantly with demo mode.</p>
              <p>3. Show the confidence score and alert state.</p>
              <p>4. Complete the flow and watch caregiver visibility update.</p>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
            <p className="text-base font-semibold uppercase tracking-[0.22em] text-stone-500">Caregiver visibility</p>
            <p className="mt-4 text-2xl font-semibold text-stone-900">{caregiverEmail ?? "No caregiver email linked yet"}</p>
            <p className="mt-2 text-base leading-8 text-stone-600">
              Wrong medication and missed-dose simulations will push alerts into the caregiver feed automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
