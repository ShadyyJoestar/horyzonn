"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Check,
  Clipboard,
  ExternalLink,
  Globe2,
  Link2,
  LockKeyhole,
  ShieldOff,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { revokeShareById } from "@/lib/actions/share";

export type ShareManagerItem = {
  id: string;
  assessmentId: string;
  token: string;
  message: string | null;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  audience: "link" | "counselor";

  counselor: {
    name: string | null;
    email: string | null;
    role: string | null;
  } | null;

  assessment: {
    createdAt: string;
    readinessScore: number | null;
    classification: string | null;
    careerName: string | null;
  };
};

function formatDate(value: string | null) {
  if (!value) return "No expiry";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getStatus(item: ShareManagerItem) {
  if (item.revokedAt) {
    return "revoked" as const;
  }

  if (
    item.expiresAt &&
    new Date(item.expiresAt).getTime() <= Date.now()
  ) {
    return "expired" as const;
  }

  return "active" as const;
}

export function ShareManager({
  items,
}: {
  items: ShareManagerItem[];
}) {
  const router = useRouter();

  const [copiedId, setCopiedId] = useState<string | null>(
    null
  );

  const [revokingId, setRevokingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);

  const enriched = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        status: getStatus(item),
      })),
    [items]
  );

  const activeItems = enriched.filter(
    (item) => item.status === "active"
  );

  const historyItems = enriched.filter(
    (item) => item.status !== "active"
  );

  async function copyLink(item: ShareManagerItem) {
    try {
      const url = `${window.location.origin}/share/${item.token}`;

      await navigator.clipboard.writeText(url);

      setCopiedId(item.id);
      setError(null);

      window.setTimeout(() => {
        setCopiedId((current) =>
          current === item.id ? null : current
        );
      }, 2000);
    } catch {
      setError(
        "Gagal menyalin link. Coba copy manual dari browser."
      );
    }
  }

  async function revoke(item: ShareManagerItem) {
    const confirmed = window.confirm(
      "Revoke share ini? Link akan langsung tidak bisa digunakan lagi."
    );

    if (!confirmed) return;

    setRevokingId(item.id);
    setError(null);

    const result = await revokeShareById(item.id);

    if (result.error) {
      setError(result.error);
      setRevokingId(null);
      return;
    }

    router.refresh();
    setRevokingId(null);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-medium">
              Belum ada assessment yang dibagikan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Setelah kamu menekan tombol Share di halaman hasil
              assessment, link-nya akan muncul dan bisa dikelola dari
              sini.
            </p>

            <Button
              className="mt-5"
              variant="outline"
              render={<Link href="/dashboard/assessment" />}
              nativeButton={false}
            >
              Buka assessment history
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">
                  Active shares
                </h3>

                <p className="text-sm text-muted-foreground">
                  Link yang masih bisa digunakan.
                </p>
              </div>

              <Badge variant="secondary">
                {activeItems.length}
              </Badge>
            </div>

            {activeItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Tidak ada share aktif saat ini.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeItems.map((item) => {
                  const privateShare =
                    item.audience === "counselor";

                  const recipientName =
                    item.counselor?.name ||
                    item.counselor?.email ||
                    "Counselor";

                  return (
                    <Card key={item.id}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">
                              {item.assessment.careerName ||
                                "Career assessment"}
                            </CardTitle>

                            <CardDescription>
                              Assessment dibuat{" "}
                              {formatDateOnly(
                                item.assessment.createdAt
                              )}
                            </CardDescription>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant="secondary">
                              {privateShare ? (
                                <>
                                  <LockKeyhole className="mr-1 h-3 w-3" />
                                  Private
                                </>
                              ) : (
                                <>
                                  <Globe2 className="mr-1 h-3 w-3" />
                                  Link
                                </>
                              )}
                            </Badge>

                            {item.assessment.classification && (
                              <Badge variant="outline">
                                {item.assessment.classification}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground">
                              Readiness
                            </p>

                            <p className="mt-1 font-semibold">
                              {item.assessment.readinessScore !=
                              null
                                ? `${item.assessment.readinessScore}/100`
                                : "Not available"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground">
                              Shared at
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>

                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground">
                              Expires
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {formatDate(item.expiresAt)}
                            </p>
                          </div>
                        </div>

                        {privateShare && (
                          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                            <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                Shared with {recipientName}
                              </p>

                              {item.counselor?.email &&
                                item.counselor.email !==
                                  recipientName && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {item.counselor.email}
                                  </p>
                                )}
                            </div>
                          </div>
                        )}

                        {item.message && (
                          <div className="rounded-lg border-l-2 border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                            “{item.message}”
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(item)}
                          >
                            {copiedId === item.id ? (
                              <Check className="mr-2 h-4 w-4" />
                            ) : (
                              <Clipboard className="mr-2 h-4 w-4" />
                            )}

                            {copiedId === item.id
                              ? "Copied"
                              : "Copy link"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            render={
                              <Link
                                href={`/share/${item.token}`}
                                target="_blank"
                                rel="noreferrer"
                              />
                            }
                            nativeButton={false}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open preview
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revoke(item)}
                            disabled={revokingId === item.id}
                          >
                            <ShieldOff className="mr-2 h-4 w-4" />

                            {revokingId === item.id
                              ? "Revoking..."
                              : "Revoke"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">
                  Share history
                </h3>

                <p className="text-sm text-muted-foreground">
                  Link yang sudah dicabut atau kedaluwarsa.
                </p>
              </div>

              <Badge variant="secondary">
                {historyItems.length}
              </Badge>
            </div>

            {historyItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Belum ada riwayat share.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item) => (
                  <Card
                    key={item.id}
                    className="opacity-75"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {item.assessment.careerName ||
                              "Career assessment"}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {item.assessment.readinessScore !=
                            null
                              ? `Readiness ${item.assessment.readinessScore}/100 · `
                              : ""}
                            Shared{" "}
                            {formatDate(item.createdAt)}
                          </p>

                          {item.audience === "counselor" && (
                            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />

                              {item.counselor?.email ||
                                item.counselor?.name ||
                                "Counselor"}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="secondary">
                            {item.status === "expired"
                              ? "Expired"
                              : "Revoked"}
                          </Badge>

                          <Button
                            size="sm"
                            variant="ghost"
                            render={
                              <Link
                                href={`/dashboard/assessment/${item.assessmentId}`}
                              />
                            }
                            nativeButton={false}
                          >
                            View assessment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}