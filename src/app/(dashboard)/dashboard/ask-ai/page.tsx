import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AskAiChat } from "@/components/ai/ask-ai-chat";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Ask AI · Horyzon",
};

export default async function AskAiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ask AI</h2>
        <p className="text-muted-foreground mt-1">
          Tanya seputar assessment, skill gap, dan jalur karier. Jawaban AI
          memakai konteks profilmu — bukan jaminan hasil, dan bukan pengganti
          counselor.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chat</CardTitle>
          <CardDescription>
            Powered by DeepSeek. Untuk pertanyaan personal/kompleks, gunakan{" "}
            <a href="/dashboard/ask-counselor" className="underline">
              Ask counselor
            </a>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AskAiChat />
        </CardContent>
      </Card>
    </div>
  );
}