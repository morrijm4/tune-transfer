import type { PropsWithChildren, FormHTMLAttributes } from 'react';

type FormProps = PropsWithChildren<FormHTMLAttributes<HTMLFormElement>>;

export function Form({ children, ...rest }: FormProps) {
  return (
    <form className="flex flex-col items-center space-y-2" {...rest}>
      {children}
    </form>
  );
}

export default Form;
