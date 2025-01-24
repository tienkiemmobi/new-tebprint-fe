import { Button, PayoneerIcon } from '@ui';

type PayoneerButtonProps = {
  className?: string;
};

const PayoneerButton = (props: PayoneerButtonProps) => {
  const { className } = props;

  return (
    <Button className={className}>
      <PayoneerIcon />
    </Button>
  );
};

export { PayoneerButton };
