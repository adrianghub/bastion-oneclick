"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !ready) return null;
  return <>{children}</>;
}
