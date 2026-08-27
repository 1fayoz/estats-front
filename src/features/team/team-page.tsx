"use client";

import * as React from "react";
import { Loader2, Plus, Send, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { CardList, DataCard, TableWrap } from "@/components/dashboard/data-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addTeamMember,
  ApiError,
  getPermissionCatalogue,
  getTeam,
  removeTeamMember,
  updateTeamMember,
} from "@/lib/api";
import type { PermissionModule, TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

import { PermissionPicker } from "./permission-picker";

export function TeamPage() {
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [modules, setModules] = React.useState<PermissionModule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<TeamMember | null>(null);
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [rows, catalogue] = await Promise.all([
        getTeam(),
        getPermissionCatalogue(),
      ]);
      setMembers(rows);
      setModules(catalogue);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const upsert = (member: TeamMember) =>
    setMembers((prev) => {
      const found = prev.some((m) => m.id === member.id);
      return found ? prev.map((m) => (m.id === member.id ? member : m)) : [...prev, member];
    });

  const drop = async (member: TeamMember) => {
    try {
      await removeTeamMember(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success("O'chirildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jamoa"
        description="Hisobingizga kim ulangan va u nimani ko'ra oladi"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setAdding(true)}>
            <UserPlus className="h-3.5 w-3.5" /> Odam qo&apos;shish
          </Button>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
          </CardContent>
        </Card>
      ) : members.length === 0 ? (
        <EmptyState onAdd={() => setAdding(true)} />
      ) : (
        <>
          <CardList>
            {members.map((member) => (
              <DataCard key={member.id} onClick={() => setEditing(member)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {member.name || member.email || member.phone}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {member.phone}
                    </div>
                  </div>
                  <StatusBadge member={member} />
                </div>
                <ActionSummary member={member} modules={modules} className="mt-2.5" />
              </DataCard>
            ))}
          </CardList>

          <TableWrap>
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Odam</th>
                  <th className="px-4 py-2.5 font-medium">Raqam</th>
                  <th className="px-4 py-2.5 font-medium">Ruxsatlari</th>
                  <th className="px-4 py-2.5 font-medium">Holat</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{member.name || "—"}</div>
                      {member.email ? (
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{member.phone}</td>
                    <td className="max-w-sm px-4 py-3">
                      <ActionSummary member={member} modules={modules} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge member={member} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing(member)}
                        >
                          Ruxsatlar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => void drop(member)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </>
      )}

      <MemberDialog
        open={adding}
        onClose={() => setAdding(false)}
        modules={modules}
        onSaved={upsert}
      />
      <MemberDialog
        open={editing !== null}
        member={editing}
        onClose={() => setEditing(null)}
        modules={modules}
        onSaved={upsert}
        onRemove={drop}
      />
    </div>
  );
}

function StatusBadge({ member }: { member: TeamMember }) {
  if (!member.isActive) return <Badge variant="outline">O&apos;chirilgan</Badge>;
  if (!member.accepted) {
    // Bog'lanmagan taklif — egasi raqamni xato yozgan bo'lishi
    // mumkinligini bilib turishi kerak.
    return <Badge variant="outline">Kutilmoqda</Badge>;
  }
  return <Badge variant="secondary">Ulangan</Badge>;
}

/** Ruxsatlar sonini odam tilida: "Foyda, SEO va yana 2 ta". */
function ActionSummary({
  member,
  modules,
  className,
}: {
  member: TeamMember;
  modules: PermissionModule[];
  className?: string;
}) {
  const names = React.useMemo(() => {
    const byCode = new Map(
      modules.flatMap((m) => m.actions.map((a) => [a.code, a.name] as const))
    );
    return member.actions.map((code) => byCode.get(code) ?? code);
  }, [member.actions, modules]);

  if (!names.length) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Hech nima ochilmagan
      </span>
    );
  }
  const shown = names.slice(0, 2).join(", ");
  const rest = names.length - 2;
  return (
    <span className={cn("block truncate text-xs text-muted-foreground", className)}>
      {shown}
      {rest > 0 ? ` va yana ${rest} ta` : ""}
    </span>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" /> Hozircha yolg&apos;izsiz
        </CardTitle>
        <CardDescription>
          Buxgalter, kontent menejer yoki hamkoringizni qo&apos;shing va har biriga
          faqat kerakli bo&apos;limni oching.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Odamning telefon raqamini yozasiz.</li>
          <li>2. Qaysi sahifalarni ko&apos;rishini belgilaysiz.</li>
          <li>
            3. U saytga Google orqali kiradi va Sozlamalarda AYNAN shu raqamni
            yozadi — hisobingiz o&apos;zi ochiladi.
          </li>
        </ol>
        <Button size="sm" className="gap-1.5" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" /> Birinchi odamni qo&apos;shish
        </Button>
      </CardContent>
    </Card>
  );
}

function MemberDialog({
  open,
  member,
  modules,
  onClose,
  onSaved,
  onRemove,
}: {
  open: boolean;
  member?: TeamMember | null;
  modules: PermissionModule[];
  onClose: () => void;
  onSaved: (member: TeamMember) => void;
  onRemove?: (member: TeamMember) => void | Promise<void>;
}) {
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [actions, setActions] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setPhone(member?.phone ?? "");
    setName(member?.name ?? "");
    setActions(member?.actions ?? []);
  }, [open, member]);

  const save = async () => {
    setBusy(true);
    try {
      const saved = member
        ? await updateTeamMember(member.id, { name, actions })
        : await addTeamMember({ phone, name, actions });
      onSaved(saved);
      toast.success(member ? "Saqlandi." : "Qo'shildi.");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{member ? "Ruxsatlar" : "Odam qo'shish"}</DialogTitle>
          <DialogDescription>
            {member
              ? "Belgilangan bo'limlar shu odamga ochiq bo'ladi."
              : "Raqam bo'yicha taklif qilinadi — u kirganda hisobingiz o'zi ochiladi."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="member-phone">Telefon raqami</Label>
              <Input
                id="member-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                inputMode="tel"
                // Raqam — bog'lanish kaliti; o'zgartirilsa boshqa
                // odamning taklifiga aylanadi. Kerak bo'lsa
                // o'chirib, qaytadan qo'shiladi.
                disabled={Boolean(member)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Ismi</Label>
              <Input
                id="member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Aziza (buxgalter)"
              />
            </div>
          </div>

          <PermissionPicker modules={modules} value={actions} onChange={setActions} />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
          {member && onRemove ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={async () => {
                await onRemove(member);
                onClose();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Jamoadan chiqarish
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              onClick={save}
              disabled={busy || (!member && phone.trim().length < 9)}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Saqlash
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
