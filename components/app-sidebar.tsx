"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Settings, Users } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/roster", label: "Elenco", icon: Users },
  { href: "/settings", label: "Time", icon: Settings },
];

type TeamMembership = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "strategist" | "driver";
};

const roleLabels: Record<TeamMembership["role"], string> = {
  owner: "Dono",
  strategist: "Estrategista",
  driver: "Piloto",
};

export function AppSidebar({
  teams,
  email,
  hasPassword,
  hasDiscord,
  version,
}: {
  teams: TeamMembership[];
  email: string;
  hasPassword: boolean;
  hasDiscord: boolean;
  version: string;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-1">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="w-auto hover:bg-transparent active:bg-transparent"
                render={<Link href="/dashboard" />}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                  S
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-sm font-semibold tracking-tight">
                    Stintly
                  </span>
                  <span className="text-xs text-muted-foreground">
                    v{version}
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {teams.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Minhas equipes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {teams.map((team) => (
                  <SidebarMenuItem key={team.id}>
                    <SidebarMenuButton
                      tooltip={`${team.name} · ${roleLabels[team.role]}`}
                      className="cursor-default hover:bg-transparent active:bg-transparent"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent text-[10px] font-medium uppercase">
                        {team.name.slice(0, 1)}
                      </span>
                      <span className="truncate">{team.name}</span>
                      <span className="ml-auto text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                        {roleLabels[team.role]}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="hidden justify-center group-data-[collapsible=icon]:flex">
            <SidebarTrigger title="Expandir menu" />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AccountMenu
              email={email}
              hasPassword={hasPassword}
              hasDiscord={hasDiscord}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
