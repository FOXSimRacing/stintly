"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InviteUserDialog } from "@/components/invite-user-dialog";

export function InviteUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus />
        Convidar usuário
      </Button>
      <InviteUserDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
