"use client";

import * as React from "react";
import { Check, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError, setProfile } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";

/**
 * Hisobning ko'rinadigan nomi.
 *
 * Google bergan ism har doim ham to'g'ri kelavermaydi: sotuvchi
 * hisobni do'kon nomi bilan atashni afzal ko'radi. Nom yuqori
 * panelda va Jamoa sahifasida a'zolarga ham ko'rinadi, ya'ni uni
 * o'zgartira olish kerak.
 */
export function NameCard() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const saved = user?.fullName ?? "";
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setValue(saved);
  }, [saved]);

  const dirty = value.trim() !== saved && value.trim().length > 0;

  const save = async () => {
    setBusy(true);
    try {
      setUser(await setProfile(value.trim()));
      toast.success("Nom saqlandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" /> Hisob nomi
        </CardTitle>
        <CardDescription>
          Yuqori panelda va Jamoa sahifasida shu nom ko&apos;rinadi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Masalan: Luna House"
            maxLength={150}
            className="sm:max-w-xs"
          />
          <Button onClick={save} disabled={busy || !dirty}>
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Saqlash
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
