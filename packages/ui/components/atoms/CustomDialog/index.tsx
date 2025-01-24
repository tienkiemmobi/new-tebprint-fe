type CustomDialogProps = {
  open: boolean;
  handleClose: () => void;
  dialogContent: JSX.Element;
  dialogProperty?: React.HTMLAttributes<HTMLDialogElement>;
  formProperty?: React.HTMLAttributes<HTMLFormElement>;
};

const CustomDialog = ({
  open,
  handleClose,
  dialogContent,
  dialogProperty,
  formProperty = { className: 'rounded-[3px]' },
}: CustomDialogProps) => {
  return (
    <dialog
      id="editProductModal"
      className={`dsy-modal bg-[#353a4780] ${dialogProperty?.className}`}
      open={open}
      onClick={handleClose}
    >
      <form
        method="dialog"
        className={`dsy-modal-box relative max-h-full max-w-full p-0 md:max-h-[70vh] md:max-w-[500px] lg:max-w-[800px] ${formProperty.className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {dialogContent}
      </form>
    </dialog>
  );
};

export { CustomDialog };
