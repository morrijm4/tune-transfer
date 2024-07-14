import type { PropsWithChildren, FormHTMLAttributes } from 'react';

type FormProps = PropsWithChildren<FormHTMLAttributes<HTMLFormElement>>;

export function Form({ children, ...rest }: FormProps) {
  return (
    <form className="flex flex-col" {...rest}>
      {children}
    </form>
  );
}

export default Form;
