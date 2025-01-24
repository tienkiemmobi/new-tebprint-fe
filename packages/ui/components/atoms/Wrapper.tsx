import React from 'react';

type WrapperProps = {
  children?: React.ReactNode;
};

const Wrapper: React.FC<WrapperProps> = (props) => {
  return <div className="flex flex-col sm:justify-center md:items-center">{props.children}</div>;
};

export { Wrapper };
