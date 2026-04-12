import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Medication confidence, without the friction"
      title="Sign in to your medication timeline."
      description="MedEase keeps medication routines clear for seniors and visible for caregivers, with large-type screens and guided confirmation steps."
      footer={
        <p>
          New here?{" "}
          <Link className="font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4" href="/signup">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Welcome back</h2>
        <p className="text-base leading-7 text-stone-600">
          Use your email and password to open your senior dashboard or caregiver feed.
        </p>
      </div>
      <div className="mt-8">
        <LoginForm />
      </div>
    </AuthShell>
  );
}
