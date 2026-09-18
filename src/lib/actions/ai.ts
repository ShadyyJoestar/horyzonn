"use server";

import { createClient } from "@/lib/supabase/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AskAiResult = {
  error?: string;
  reply?: string;
};

const SYSTEM_PROMPT = `You are Horyzon AI Assistant — a career & academic guidance helper for Indonesian students (SMA/SMK/college).

Rules:
- Answer in the same language the user uses (Indonesian or English).
- Be practical, honest, and encouraging. No hype.
- You help interpret assessments, competency gaps, study paths, and career exploration.
- You are NOT a guarantee of job offers, university admission, or outcomes.
- If the question needs personal judgment (family situation, mental health, legal), suggest talking to a human counselor.
- Keep answers concise (max ~250 words) unless the user asks for detail.
- Use the student's context below when relevant.`;

async function buildStudentContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: assessments },
    { data: competencies },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, primary_focus")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("assessment_results")
      .select("readiness_score, classification, created_at, careers(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("user_competencies")
      .select("level, competencies(name)")
      .eq("user_id", userId)
      .limit(12),
  ]);

  const lines: string[] = [];

  if (profile?.full_name) lines.push(`Name: ${profile.full_name}`);
  if (profile?.primary_focus) lines.push(`Focus: ${profile.primary_focus}`);

  if (assessments && assessments.length > 0) {
    lines.push("Recent assessments:");
    for (const a of assessments) {
      const career = Array.isArray(a.careers) ? a.careers[0] : a.careers;
      const careerName =
        (career as { name?: string } | null)?.name ?? "Unknown career";
      lines.push(
        `- ${careerName}: score ${a.readiness_score ?? "—"}, ${a.classification ?? "—"}`
      );
    }
  }

  if (competencies && competencies.length > 0) {
    lines.push("Skills (sample):");
    for (const c of competencies) {
      const comp = Array.isArray(c.competencies)
        ? c.competencies[0]
        : c.competencies;
      const name = (comp as { name?: string } | null)?.name ?? "skill";
      lines.push(`- ${name}: level ${c.level}`);
    }
  }

  if (lines.length === 0) {
    return "No profile/assessment data yet.";
  }

  return lines.join("\n");
}

export async function askAi(input: {
  message: string;
  history?: ChatMessage[];
}): Promise<AskAiResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const message = input.message?.trim();
  if (!message) return { error: "Pesan tidak boleh kosong" };
  if (message.length > 2000) return { error: "Pesan maksimal 2000 karakter" };

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      error:
        "DEEPSEEK_API_KEY belum diset di environment. Tambahkan di .env.local.",
    };
  }

  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const context = await buildStudentContext(user.id);

  const history = (input.history ?? []).slice(-8).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 2000),
  }));

  const messages = [
    {
      role: "system" as const,
      content: `${SYSTEM_PROMPT}\n\nStudent context:\n${context}`,
    },
    ...history,
    { role: "user" as const, content: message },
  ];

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[askAi] DeepSeek error:", res.status, text);

      if (res.status === 401) {
        return { error: "API key DeepSeek tidak valid." };
      }
      if (res.status === 402 || res.status === 429) {
        return {
          error:
            "Kuota DeepSeek habis atau rate limited. Coba lagi nanti atau top-up di platform.deepseek.com.",
        };
      }
      return { error: `DeepSeek error (${res.status}). Coba lagi.` };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return { error: "Tidak ada respons dari AI." };

    return { reply };
  } catch (e) {
    console.error("[askAi]", e);
    return {
      error: e instanceof Error ? e.message : "Gagal menghubungi DeepSeek",
    };
  }
}