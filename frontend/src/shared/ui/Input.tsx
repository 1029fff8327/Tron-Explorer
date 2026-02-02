import { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: Props) {
  return (
    <input
      className={[
        'w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm',
        'placeholder:text-white/40 outline-none',
        'focus:border-white/25 focus:ring-2 focus:ring-white/10',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
