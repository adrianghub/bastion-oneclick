import { RouteGuard } from "@/components/auth/route-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className='min-h-[100svh] grid grid-rows-[auto_1fr]'>
        <header className='border-b bg-card text-card-foreground'>
          <div className='mx-auto max-w-6xl px-6 py-4'>
            <h1 className='text-lg font-semibold'>Bastion Dashboard</h1>
          </div>
        </header>
        <div className='grid grid-cols-[240px_1fr]'>
          <aside className='border-r bg-muted/40 p-4'>
            <nav className='space-y-2 text-sm'>
              <div className='font-medium text-muted-foreground'>
                Navigation
              </div>
              <ul className='space-y-1'>
                <li className='rounded-md px-2 py-1.5 hover:bg-accent'>
                  Overview
                </li>
                <li className='rounded-md px-2 py-1.5 hover:bg-accent'>
                  Settings
                </li>
                <li className='rounded-md px-2 py-1.5 hover:bg-accent'>Logs</li>
              </ul>
            </nav>
          </aside>
          <main className='p-6'>{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
