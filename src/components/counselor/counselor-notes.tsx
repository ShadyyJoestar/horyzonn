// src/components/counselor/counselor-notes.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addCounselorNote,
  updateCounselorNote,
  deleteCounselorNote,
} from "@/lib/actions/counselor";
import { Pencil, Trash2, Check, X } from "lucide-react";

export interface CounselorNoteItem {
  id: string;
  author_id: string;
  author_name: string;
  note: string;
  created_at: string;
}

export function CounselorNotes({
  assessmentId,
  currentUserId,
  notes,
}: {
  assessmentId: string;
  currentUserId: string;
  notes: CounselorNoteItem[];
}) {
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSaving(true);
    setError(null);
    const res = await addCounselorNote({
      assessmentId,
      note: newNote,
    });
    setSaving(false);
    if (res.error) {
      setError(res.error);
    } else {
      setNewNote("");
    }
  }

  async function handleSaveEdit(noteId: string) {
    setSaving(true);
    setError(null);
    const res = await updateCounselorNote({
      noteId,
      assessmentId,
      note: editingText,
    });
    setSaving(false);
    if (res.error) {
      setError(res.error);
    } else {
      setEditingId(null);
    }
  }

  async function handleDelete(noteId: string) {
    setSaving(true);
    setError(null);
    const res = await deleteCounselorNote({ noteId, assessmentId });
    setSaving(false);
    if (res.error) setError(res.error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Counselor Notes</CardTitle>
        <CardDescription>
          Catatan internal kamu tentang assessment ini. Siswa pemilik
          assessment bisa membacanya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-2">
          <Textarea
            placeholder="Tulis catatan untuk siswa ini… (mis. saran pengembangan, observasi, next step)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            disabled={saving}
          />
          <Button type="submit" size="sm" disabled={saving || !newNote.trim()}>
            {saving ? "Saving…" : "Add note"}
          </Button>
        </form>

        <div className="space-y-3">
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada catatan.
            </p>
          )}
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {n.author_name} ·{" "}
                  {new Date(n.created_at).toLocaleString("en-US")}
                </p>
                {n.author_id === currentUserId && editingId !== n.id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditingId(n.id);
                        setEditingText(n.note);
                      }}
                      disabled={saving}
                      aria-label="Edit note"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(n.id)}
                      disabled={saving}
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {editingId === n.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    disabled={saving}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(n.id)}
                      disabled={saving || !editingText.trim()}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                    >
                      <X className="mr-1 h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm whitespace-pre-wrap">{n.note}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}