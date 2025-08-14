"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Button onClick={handleSignOut} variant='outline'>
      Sign out
    </Button>
  );
}
