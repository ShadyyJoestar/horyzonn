import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  ShareManager,
  type ShareManagerItem,
} from "@/components/dashboard/share-manager";

export const metadata = {
  title: "Shared assessments · Horyzon",
};

type AssessmentRow = {
  id: string;
  readiness_score: number | null;
  classification: string | null;
  created_at: string;
  careers:
    | { name: string | null }
    | { name: string | null }[]
    | null;
};

type ShareRow = {
  id: string;
  assessment_id: string;
  token: string;
  message: string | null;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  counselor_id: string | null;
};

type CounselorRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default async function DashboardSharePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shares, error: sharesError } = await supabase
    .from("shared_assessments")
    .select(
      "id, assessment_id, token, message, created_at, expires_at, revoked_at, counselor_id"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (sharesError) {
    console.error(
      "[dashboard/share] shares query error:",
      sharesError.message
    );
  }

  const safeShares = (shares ?? []) as ShareRow[];

  const assessmentIds = [
    ...new Set(
      safeShares.map((share) => share.assessment_id)
    ),
  ];

  const counselorIds = [
    ...new Set(
      safeShares
        .map((share) => share.counselor_id)
        .filter(
          (id): id is string => Boolean(id)
        )
    ),
  ];

  let assessments: AssessmentRow[] = [];
  let counselors: CounselorRow[] = [];

  if (assessmentIds.length > 0) {
    const { data, error } = await supabase
      .from("assessment_results")
      .select(
        "id, readiness_score, classification, created_at, careers(name)"
      )
      .eq("user_id", user.id)
      .in("id", assessmentIds);

    if (error) {
      console.error(
        "[dashboard/share] assessment query error:",
        error.message
      );
    } else {
      assessments = (data ?? []) as AssessmentRow[];
    }
  }

  if (counselorIds.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role"
      )
      .in("id", counselorIds);

    if (error) {
      console.error(
        "[dashboard/share] counselor query error:",
        error.message
      );
    } else {
      counselors = (data ?? []) as CounselorRow[];
    }
  }

  const assessmentMap = new Map(
    assessments.map((assessment) => [
      assessment.id,
      assessment,
    ])
  );

  const counselorMap = new Map(
    counselors.map((counselor) => [
      counselor.id,
      counselor,
    ])
  );

  const items: ShareManagerItem[] = safeShares
    .map((share): ShareManagerItem | null => {
      const assessment = assessmentMap.get(
        share.assessment_id
      );

      if (!assessment) {
        return null;
      }

      const career = Array.isArray(assessment.careers)
        ? assessment.careers[0]
        : assessment.careers;

      const counselor = share.counselor_id
        ? counselorMap.get(share.counselor_id) ?? null
        : null;

      // Explicit typing supaya TypeScript tidak melebarkan
      // literal "counselor" | "link" menjadi string.
      const audience: ShareManagerItem["audience"] =
        share.counselor_id
          ? "counselor"
          : "link";

      return {
        id: share.id,
        assessmentId: share.assessment_id,
        token: share.token,
        message: share.message,
        createdAt: share.created_at,
        expiresAt: share.expires_at,
        revokedAt: share.revoked_at,
        audience,

        counselor: counselor
          ? {
              name: counselor.full_name,
              email: counselor.email,
              role: counselor.role,
            }
          : null,

        assessment: {
          createdAt: assessment.created_at,
          readinessScore:
            assessment.readiness_score,
          classification:
            assessment.classification,
          careerName: career?.name ?? null,
        },
      };
    })
    .filter(
      (
        item
      ): item is ShareManagerItem =>
        item !== null
    );

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Shared assessments
        </h2>

        <p className="text-muted-foreground mt-1">
          Kelola assessment yang pernah kamu bagikan
          lewat link atau langsung ke counselor.
        </p>
      </div>

      {sharesError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Gagal memuat daftar share:{" "}
          {sharesError.message}
        </div>
      )}

      <ShareManager items={items} />
    </div>
  );
}