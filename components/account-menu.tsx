"use client";

import { useState, useTransition } from "react";

import { logout } from "@/app/(app)/actions";
import { useDiscordOAuth } from "@/app/(auth)/discord-button";
import { SetPasswordDialog } from "@/components/set-password-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({
  email,
  hasPassword,
  hasDiscord,
}: {
  email: string;
  hasPassword: boolean;
  hasDiscord: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const discordLink = useDiscordOAuth("link", "/dashboard");
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto max-w-80">
          <DropdownMenuGroup>
            <DropdownMenuLabel
              title={email}
              className="truncate font-normal text-muted-foreground"
            >
              {email}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {!hasPassword && (
            <DropdownMenuItem onClick={() => setSetPasswordOpen(true)}>
              Definir senha
            </DropdownMenuItem>
          )}
          {!hasDiscord && (
            <DropdownMenuItem
              disabled={discordLink.isPending}
              onClick={discordLink.trigger}
            >
              {discordLink.isPending ? "Redirecionando..." : "Vincular Discord"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => logout())}
          >
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SetPasswordDialog open={setPasswordOpen} onOpenChange={setSetPasswordOpen} />
      {discordLink.error && (
        <span role="alert" className="sr-only">
          {discordLink.error}
        </span>
      )}
    </>
  );
}
