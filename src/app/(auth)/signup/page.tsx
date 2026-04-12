import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Built for older adults and the people helping them"
      title="Create a MedEase account in under a minute."
      description="Start with a senior or caregiver account, then add prescriptions, log doses, and turn on demo mode for judge-friendly walkthroughs."
      footer={
        <p>
          Already have an account?{" "}
          <Link className="font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4" href="/login">
            Sign in instead
          </Link>
        </p>
      }
    >
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Create your account</h2>
        <p className="text-base leading-7 text-stone-600">
          Your first setup creates the secure account used for prescriptions, verification history, and caregiver updates.
        </p>
      </div>
      <div className="mt-8">
        <SignupForm />
      </div>
    </AuthShell>
  );
}
