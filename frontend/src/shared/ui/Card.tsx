import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-sm">
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-white/10 px-5 py-4">{children}</div>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="px-5 py-4">{children}</div>;
}
