'use client';

import { type ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, ...rest }: ButtonProps) {
  return (
    <button className="border px-4 py-1 rounded" {...rest}>
      {children}
    </button>
  );
}
