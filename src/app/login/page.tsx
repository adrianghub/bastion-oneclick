"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const callbackUrl = "/dashboard";

  return (
    <div className='min-h-[100svh] w-full grid place-items-center p-6'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4'>
            <Button asChild className='w-full'>
              <a
                href={`/api/auth/signin/github?callbackUrl=${encodeURIComponent(
                  callbackUrl
                )}`}
              >
                Continue with GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
