'use client';

import { useState, type ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  action?: () => void;
};

export function Button({ children, action, ...rest }: ButtonProps) {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <p>transferring....</p>;
  }

  return (
    <button
      onClick={async () => {
        if (action) {
          setLoading(true);
          await action();
          setLoading(false);
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
