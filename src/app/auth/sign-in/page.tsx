import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-lg border p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to agent-showcase</h1>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <Button type="submit" className="w-full" variant="outline">
            Continue with GitHub
          </Button>
        </form>
      </div>
    </div>
  );
}
