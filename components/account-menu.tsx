"use client";

import { useState, useTransition } from "react";
import { ChevronsUpDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

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
  const { theme, setTheme } = useTheme();
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              size="lg"
              className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
            />
          }
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate text-left text-sm">{email}</span>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-(--anchor-width) min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel
              title={email}
              className="truncate font-normal text-muted-foreground"
            >
              {email}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {theme === "dark" ? (
                <Moon />
              ) : theme === "light" ? (
                <Sun />
              ) : (
                <Monitor />
              )}
              Tema
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">
                  <Sun /> Claro
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon /> Escuro
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor /> Sistema
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
