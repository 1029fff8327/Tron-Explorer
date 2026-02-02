import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed';

  const styles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-white/90'
      : 'border border-white/15 bg-transparent text-white hover:bg-white/5';

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
