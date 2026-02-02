import { Card, CardContent } from '@/shared/ui/Card';

import { LimitsDto } from '@/shared/api/transactions.api';

function fmtCountdown(ms: number) {
  const v = Math.max(0, ms || 0);
  const totalSec = Math.ceil(v / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function LimitsPanel({ limits }: { limits: LimitsDto }) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-white/60">Daily (UTC day)</div>
            <div className="mt-1 text-lg font-semibold">
              {limits.dailyRemaining}/{limits.dailyLimit}
            </div>
            <div className="text-xs text-white/50">{limits.dayUtc}</div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-white/60">Per minute</div>
            <div className="mt-1 text-lg font-semibold">
              {limits.minuteRemaining}/{limits.minuteLimit}
            </div>
            <div className="text-xs text-white/50">
              reset in: {fmtCountdown(limits.minuteResetInMs)}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-white/60">Hint</div>
            <div className="mt-1 text-white/80">
              Pagination makes a new request → consumes limits
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
