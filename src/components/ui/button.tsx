'use client';

import { type ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export type ButtonVariant = 'primary' | 'secondary';

export function Button({
  children,
  variant = 'primary',
  ...rest
}: ButtonProps) {
  return (
    <button className={getClassName(variant)} {...rest}>
      {children}
    </button>
  );
}

function getClassName(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600';
    case 'secondary':
      return 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600';
  }
}
