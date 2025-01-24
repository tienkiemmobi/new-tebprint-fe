import React, { useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

type TooltipFileNameProps = {
  fileName: string;
};

const TooltipFileName: React.FC<TooltipFileNameProps> = ({ fileName }) => {
  const maxLength: number = 15;
  const [tooltipText, setTooltipText] = useState<string>(fileName);

  const shortenFileName = (text: string, maxLengthText: number) => {
    if (text.length > maxLengthText) {
      return `${text.slice(0, maxLengthText)}...`;
    }

    return text;
  };

  return (
    <div>
      <span
        data-tooltip-id={tooltipText}
        onMouseEnter={() => setTooltipText(fileName)}
        onMouseLeave={() => setTooltipText(shortenFileName(fileName, maxLength))}
      >
        {shortenFileName(fileName, maxLength)}
      </span>
      <ReactTooltip id={tooltipText} place="bottom" content={tooltipText} />
    </div>
  );
};

export { TooltipFileName };
