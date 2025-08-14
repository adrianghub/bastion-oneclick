"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

type AgentRow = {
  uuid: string;
  created_at: string;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/agents")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((rows) => {
        if (mounted) setAgents(rows as AgentRow[]);
      })
      .catch((e) => setError(e.message || "Failed to load agents"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const generateClaimToken = async () => {
    setTokenLoading(true);
    try {
      const response = await fetch("/api/agents/claim-tokens", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to generate claim token");
      }
      const data = await response.json();
      setClaimToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate token");
    } finally {
      setTokenLoading(false);
    }
  };

  if (loading) return <p className='text-muted-foreground'>Loading…</p>;
  if (error) return <p className='text-destructive'>Error: {error}</p>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold tracking-tight'>Your agents</h2>
        <Button onClick={generateClaimToken} disabled={tokenLoading}>
          {tokenLoading ? "Generating..." : "Add New Agent"}
        </Button>
      </div>

      {claimToken && (
        <Card>
          <CardHeader>
            <CardTitle>New Agent Claim Token</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground mb-2'>
                To link your new agent, run it with the following command:
              </p>
              <code className='block bg-muted p-3 rounded text-sm font-mono'>
                ./agent --claim-token {claimToken}
              </code>
            </div>
            <div className='text-xs text-muted-foreground'>
              Token expires in 1 hour. This token can only be used once.
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setClaimToken(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {agents.length === 0 ? (
        <p className='text-muted-foreground'>
          You have no agents registered yet. Click &quot;Add New Agent&quot; to
          get started.
        </p>
      ) : (
        <ul className='space-y-2'>
          {agents.map((a) => (
            <li key={a.uuid} className='rounded-md border p-3'>
              <div className='font-mono text-sm'>{a.uuid}</div>
              <div className='text-xs text-muted-foreground'>
                {new Date(a.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
