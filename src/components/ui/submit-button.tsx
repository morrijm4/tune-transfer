import type { ButtonHTMLAttributes } from 'react';
import { Button, type ButtonProps } from './button';

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps;

export function SubmitButton({ children, ...rest }: SubmitButtonProps) {
  return (
    <Button type="submit" {...rest}>
      {children}
    </Button>
  );
}
