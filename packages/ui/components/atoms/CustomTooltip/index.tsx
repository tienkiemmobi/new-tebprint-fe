import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui';

type CustomTooltipProps = {
  tooltipTrigger: React.ReactNode;
  tooltipContent: React.ReactNode;
  delayDuration?: number;
};

function CustomTooltip({ tooltipContent, tooltipTrigger, delayDuration = 100 }: CustomTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{tooltipTrigger}</TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
export { CustomTooltip };
