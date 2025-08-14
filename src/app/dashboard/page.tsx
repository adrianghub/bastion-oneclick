"use client";

import { useEffect, useState } from "react";

type AgentRow = {
  uuid: string;
  created_at: string;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);

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

  if (loading) return <p className='text-muted-foreground'>Loading…</p>;
  if (error) return <p className='text-destructive'>Error: {error}</p>;
  if (agents.length === 0)
    return (
      <p className='text-muted-foreground'>
        You have no agents registered yet.
      </p>
    );

  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-semibold tracking-tight'>Your agents</h2>
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
    </div>
  );
}
