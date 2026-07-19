import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiscordButton } from "../discord-button";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta Stintly.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error === "oauth" && (
          <p className="text-sm text-destructive">
            Não foi possível entrar com o Discord. Tente de novo.
          </p>
        )}
        <LoginForm />
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
