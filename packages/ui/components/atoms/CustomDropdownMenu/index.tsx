import type * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui';

type MenuGroupItem = {
  originElement?: string;
  element: React.ReactNode;
  handleOnClick?: (...args: any) => void;
};

export type MenuGroup = {
  group: MenuGroupItem[];
};

export type CustomDropdownMenuProps = {
  menuTrigger: React.ReactNode;
  labelMenu?: React.ReactNode;
  menuGroup: MenuGroup[];
  contentProps?: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>;
};

function CustomDropdownMenu({ menuTrigger, labelMenu, menuGroup, contentProps }: CustomDropdownMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        {menuTrigger}
      </DropdownMenuTrigger>
      {menuGroup.length > 0 && (
        <>
          <DropdownMenuContent className="w-[calc(var(--radix-dropdown-menu-trigger-width))]" {...contentProps}>
            {labelMenu && <DropdownMenuLabel>{labelMenu}</DropdownMenuLabel>}

            {menuGroup.length > 0 &&
              menuGroup.map((item, index) => (
                <div key={index}>
                  {(index !== 0 || labelMenu) && <DropdownMenuSeparator />}
                  <DropdownMenuGroup>
                    {item.group.length > 0 &&
                      item.group.map((subItem, subIndex) => (
                        <DropdownMenuItem
                          key={`${index}-${subIndex}`}
                          onSelect={(e) => e.preventDefault()}
                          onClick={subItem.handleOnClick}
                        >
                          {subItem.element}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </div>
              ))}
          </DropdownMenuContent>
        </>
      )}
    </DropdownMenu>
  );
}

export { CustomDropdownMenu };
