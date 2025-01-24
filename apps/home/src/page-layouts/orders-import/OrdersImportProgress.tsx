import * as React from 'react';
import { Progress } from 'ui';

type OrdersImportProgressProps = {
  isDone: boolean;
  duration?: number;
};

const OrdersImportProgress = ({ isDone, duration = 20 }: OrdersImportProgressProps) => {
  const [progress, setProgress] = React.useState<number>(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev === 99) {
          clearInterval(timer);

          return prev;
        }

        return prev + 1;
      });
    }, duration);

    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (isDone) setProgress(100);
  }, [isDone]);

  return (
    <>
      <Progress value={progress} className="mx-4" />
      <p className="whitespace-nowrap text-[#9fa4a5]">{`${progress} Uploaded`}</p>
    </>
  );
};

export { OrdersImportProgress };
