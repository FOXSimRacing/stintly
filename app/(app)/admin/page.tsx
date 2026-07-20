import { db } from "@/lib/db";
import { admins } from "@/drizzle/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { InviteUserButton } from "@/components/invite-user-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export default async function AdminPage() {
  const [{ data, error }, adminRows] = await Promise.all([
    createAdminClient().auth.admin.listUsers(),
    db.select({ userId: admins.userId }).from(admins),
  ]);

  const adminIds = new Set(adminRows.map((row) => row.userId));
  const users = data?.users ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Administração
          </h1>
          <p className="text-sm text-muted-foreground">
            Usuários cadastrados na Stintly.
          </p>
        </div>
        <InviteUserButton />
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar a lista de usuários.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead>Confirmado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                <TableCell>
                  {user.email_confirmed_at ? (
                    <Badge variant="secondary">Sim</Badge>
                  ) : (
                    <Badge variant="outline">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {adminIds.has(user.id) && <Badge>Admin</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
