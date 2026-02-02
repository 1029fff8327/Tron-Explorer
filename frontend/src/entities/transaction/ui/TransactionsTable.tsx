import { formatDateTime, shortAddr } from '@/shared/lib/format';

import { TransactionDto } from '@/shared/api/transactions.api';

function dirBadge(dir: 'IN' | 'OUT') {
  return dir === 'IN'
    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20'
    : 'bg-rose-500/15 text-rose-200 border-rose-500/20';
}

export function TransactionsTable({ items }: { items: TransactionDto[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-[980px] w-full text-sm">
        <thead className="bg-white/[0.03] text-white/70">
          <tr className="text-left">
            <th className="p-3">Time</th>
            <th className="p-3">Block</th>
            <th className="p-3">From</th>
            <th className="p-3">To</th>
            <th className="p-3">Amount (TRX)</th>
            <th className="p-3">Token</th>
            <th className="p-3">Dir</th>
            <th className="p-3">TxId</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.txId} className="border-t border-white/10 hover:bg-white/[0.02]">
              <td className="p-3 whitespace-nowrap">{formatDateTime(t.timestampMs)}</td>
              <td className="p-3">{t.blockNumber ?? '-'}</td>
              <td className="p-3 font-mono">{shortAddr(t.from)}</td>
              <td className="p-3 font-mono">{shortAddr(t.to)}</td>
              <td className="p-3 font-mono">{t.amountTrx}</td>
              <td className="p-3">
                {t.asset === 'TRC20'
                  ? `${t.tokenAmount ?? ''} ${t.tokenSymbol ?? ''}`.trim() || '-'
                  : '-'}
              </td>
              <td className="p-3">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${dirBadge(t.direction)}`}>
                  {t.direction}
                </span>
              </td>
              <td className="p-3 font-mono">{shortAddr(t.txId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
