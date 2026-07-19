export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-2">
      {error === "discord_link" && (
        <p className="text-sm text-destructive">
          {reason === "identity_already_exists"
            ? "Essa conta do Discord já está vinculada a outro usuário Stintly."
            : "Não foi possível vincular sua conta do Discord. Tente de novo."}
        </p>
      )}
      <h1 className="text-2xl font-semibold tracking-tight">Provas</h1>
      <p className="text-sm text-muted-foreground">
        Nenhuma prova cadastrada ainda.
      </p>
    </div>
  );
}
