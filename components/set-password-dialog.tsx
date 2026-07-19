"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  setPasswordSchema,
  type SetPasswordInput,
} from "@/app/(app)/set-password-schema";
import { setPassword } from "@/app/(app)/actions";

export function SetPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordInput>({ resolver: zodResolver(setPasswordSchema) });

  const onSubmit = (data: SetPasswordInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await setPassword(data);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      setServerError(null);
      setSuccess(false);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir senha</DialogTitle>
          <DialogDescription>
            Depois de definir uma senha, você pode entrar com Discord ou com
            email e senha.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="text-sm text-muted-foreground">
            Senha definida com sucesso.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirme a senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Salvando..." : "Salvar senha"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
