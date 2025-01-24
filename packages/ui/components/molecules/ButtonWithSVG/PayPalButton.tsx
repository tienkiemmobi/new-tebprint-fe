import { Button, PayPallIcon } from '@ui';

type PayPalButtonProps = {
  className?: string;
};

const PayPalButton = (props: PayPalButtonProps) => {
  const { className } = props;

  return (
    <Button className={className}>
      <PayPallIcon />
    </Button>
  );
};

export { PayPalButton };
