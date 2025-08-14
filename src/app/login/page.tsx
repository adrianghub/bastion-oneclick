"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login();
    router.replace("/dashboard");
  }

  return (
    <div className='min-h-[100svh] w-full grid place-items-center p-6'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='grid gap-4' action='#' onSubmit={handleSubmit}>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' required />
            </div>
            <Button type='submit' className='w-full'>
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
