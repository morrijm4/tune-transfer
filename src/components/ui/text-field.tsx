import { PropsWithChildren } from 'react';

export type TextFieldProps = PropsWithChildren<{
  label?: string;
  name?: string;
}>;
export function TextField({ label, name }: TextFieldProps) {
  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input type="text" name={name} id={name} />
    </div>
  );
}
