import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to agent-showcase</h1>
        </div>
        <div className="mt-6">
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <Button type="submit" className="w-full">
              Continue with GitHub
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}