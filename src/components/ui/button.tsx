'use client';

import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  action?: () => void;
};

export function Button({ children, action, ...rest }: ButtonProps) {
  return (
    <button onClick={() => action?.()} {...rest}>
      {children}
    </button>
  );
}
