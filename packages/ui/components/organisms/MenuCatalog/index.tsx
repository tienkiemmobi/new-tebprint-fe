type MenuCatalogProps = {
  dataCatalog: string[];
};

const MenuCatalog = (props: MenuCatalogProps) => {
  const { dataCatalog } = props;

  return (
    <div className="mt-[1px] flex h-full w-full justify-center border-b border-gray-300 bg-white py-6 shadow-[0_1px_3px_-0px_rgba(0,0,0,0.04)]">
      <div className="flex w-[1150px] justify-between px-6">
        {dataCatalog.map((itemMenu, indexMenu) => {
          return (
            <div key={indexMenu}>
              <a href={`/products?category=${itemMenu}`}>
                <p className="pb-2 font-bold first-of-type:text-color hover:text-primary">{itemMenu}</p>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { MenuCatalog };
