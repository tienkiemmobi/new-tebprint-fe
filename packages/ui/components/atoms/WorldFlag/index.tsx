import React from 'react';

type FlagProps = {
  code: string;
  className?: string;
};

const Flag: React.FC<FlagProps> = ({ code, className }) => {
  const country = code.toLowerCase();
  const flagUrl = `https://flagcdn.com/${country}.svg`;

  return (
    <span className={className}>
      <img className="h-[17px] w-[25px] max-w-none" src={flagUrl} />
    </span>
  );
};

export { Flag };
