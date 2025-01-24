import type { PropsWithChildren } from 'react';

type AreaLayoutProps = {
  title: string;
  titleStyle?: string;
} & PropsWithChildren;

const AreaLayout = ({ title, children, titleStyle }: AreaLayoutProps) => {
  return (
    <div className="my-4 rounded-md border border-gray-300 bg-white">
      <h4 className={`border-b border-gray-300 p-6 text-2xl font-bold ${titleStyle}`}>{title}</h4>
      <div className="p-6">{children}</div>
    </div>
  );
};

export { AreaLayout };
