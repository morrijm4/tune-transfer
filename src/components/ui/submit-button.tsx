import type { ButtonHTMLAttributes } from 'react';
import { Button, type ButtonProps } from './button';

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps;

export function SubmitButton({ children, ...rest }: SubmitButtonProps) {
  return (
    <Button type="submit" className="border px-4 py-1 rounded" {...rest}>
      {children}
    </Button>
  );
}
