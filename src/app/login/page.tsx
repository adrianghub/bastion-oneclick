"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className='min-h-[100svh] w-full grid place-items-center p-6'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4'>
            <Button onClick={handleSignIn} className='w-full'>
              Continue with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
