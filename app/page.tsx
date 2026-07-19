import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Stintly
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance">
        Planejamento de stints para provas de endurance no iRacing
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground text-balance">
        Monte o rodízio de pilotos, gerencie disponibilidade e compartilhe o
        plano de prova com o time em tempo real.
      </p>
      <div className="flex gap-3">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/login">Entrar</Link>}
        />
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/signup">Criar conta</Link>}
        />
      </div>
    </div>
  );
}
