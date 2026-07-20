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
  inviteUserSchema,
  type InviteUserInput,
} from "@/app/(app)/admin/schema";
import { inviteUser } from "@/app/(app)/admin/actions";

export function InviteUserDialog({
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
  } = useForm<InviteUserInput>({ resolver: zodResolver(inviteUserSchema) });

  const onSubmit = (data: InviteUserInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await inviteUser(data);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setSuccess(true);
        reset();
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
          <DialogTitle>Convidar usuário</DialogTitle>
          <DialogDescription>
            Envia um e-mail com um link para o convidado se cadastrar e
            testar o app.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="text-sm text-muted-foreground">
            Convite enviado com sucesso.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Enviando..." : "Enviar convite"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
