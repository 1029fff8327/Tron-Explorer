import { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = '', ...props }: Props) {
  return (
    <select
      className={[
        'w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm',
        'outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
