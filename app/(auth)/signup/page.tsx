import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiscordButton } from "../discord-button";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Comece a planejar suas provas no Stintly.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SignupForm />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>
        <DiscordButton />
      </CardContent>
    </Card>
  );
}
