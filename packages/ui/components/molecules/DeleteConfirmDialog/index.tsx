import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@ui';

type DeleteConfirmDialogProps = {
  onConfirm: () => void;
  target: string;
};
const DeleteConfirmDialog: React.FC<React.PropsWithChildren<DeleteConfirmDialogProps>> = (props) => {
  const { onConfirm, target, children } = props;

  return (
    <>
      <AlertDialog>
        {children ? (
          <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        ) : (
          <AlertDialogTrigger className="w-full text-left">Delete</AlertDialogTrigger>
        )}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {target || 'record'} from our system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onConfirm()} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { DeleteConfirmDialog };
