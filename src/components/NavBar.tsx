"use client"

import { Button } from "@/components/ui/button"

interface NavBarProps {
  userImage?: string | null;
  userName?: string | null;
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

export default function NavBar({
  userImage,
  userName,
  isSignedIn,
  signIn,
  signOut,
}: NavBarProps) {
  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <div className="font-bold text-xl">App</div>
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <div className="flex items-center gap-4">
            {userImage ? (
              <img
                src={userImage}
                alt={userName || "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {userName ? userName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button onClick={signIn}>Sign in with GitHub</Button>
        )}
      </div>
    </nav>
  );
}