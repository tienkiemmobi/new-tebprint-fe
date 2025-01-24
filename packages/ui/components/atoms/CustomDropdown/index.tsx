import React from 'react';

export type CustomDropdownProps = {
  title?: string;
  labelStyle?: string;
  textStyle?: string;
  statusDropdown?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightToggleIcon?: React.ReactNode;
  leftToggleIcon?: React.ReactNode;
  dropDownContent?: React.ReactNode;
  isDropDownOpen?: boolean;
  isPreventToggle?: boolean;
};

type CustomLabelProps = Omit<CustomDropdownProps, 'listItems' | 'dropDownContent' | 'labelStyle'>;

const CustomLabel = (props: CustomLabelProps) => {
  const { title, statusDropdown, rightIcon, rightToggleIcon, leftToggleIcon, leftIcon, textStyle, isDropDownOpen } =
    props;

  return (
    <>
      {leftIcon && <div className="flex w-1/4 justify-end">{isDropDownOpen ? leftToggleIcon : leftIcon}</div>}
      <div className="flex grow md:justify-between lg:justify-normal">
        <span className={`text-[16px] font-bold leading-6 text-color ${textStyle}`}>{title}</span>
        {statusDropdown && (
          <span className="rounded-[3px] border border-[#248E4C] bg-[#E2F7E3] px-2 py-[2px] text-sm font-medium leading-5 text-[#1F6B45] md:m-0 lg:ml-6">
            {statusDropdown}
          </span>
        )}
      </div>
      {rightIcon && <div className="flex w-1/4 justify-end">{isDropDownOpen ? rightToggleIcon : rightIcon}</div>}
    </>
  );
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  title,
  statusDropdown,
  rightIcon,
  leftIcon,
  leftToggleIcon,
  rightToggleIcon,
  dropDownContent,
  labelStyle,
  textStyle,
  isDropDownOpen = false,
  isPreventToggle = false,
}) => {
  const [dropDownOpen, setDropDownOpen] = React.useState<boolean>(isDropDownOpen);

  const handleDropdown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!isPreventToggle) setDropDownOpen(!dropDownOpen);
  };

  return (
    <>
      <button onClick={handleDropdown} className={`flex items-center ${labelStyle}`}>
        <CustomLabel
          rightIcon={isPreventToggle ? null : rightIcon}
          isDropDownOpen={dropDownOpen}
          statusDropdown={statusDropdown}
          leftIcon={isPreventToggle ? null : leftIcon}
          leftToggleIcon={isPreventToggle ? null : leftToggleIcon}
          rightToggleIcon={isPreventToggle ? null : rightToggleIcon}
          title={title}
          textStyle={textStyle}
        />
      </button>
      <div
        className={`w-full overflow-hidden bg-transparent transition-all duration-700 ease-in-out ${
          isPreventToggle || dropDownOpen ? 'max-h-[10000px]' : 'max-h-0'
        }`}
      >
        {dropDownContent}
      </div>
    </>
  );
};

export { CustomDropdown };
