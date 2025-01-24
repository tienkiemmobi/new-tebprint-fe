import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Product } from 'shared';

import { ProductItem } from '@/components';

type ListProductsProps = {
  title?: string;
  listProducts?: Product[];
  className?: string;
};

const ListProducts = (props: ListProductsProps) => {
  const { title, listProducts, className } = props;

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between pb-4 md:justify-between">
          <a className="hidden h-[23px] w-[150px] md:block" href="#"></a>
          <span className="text-center text-[22px] font-bold leading-8">{title} </span>

          <div className="flex items-center justify-center">
            <a className="flex h-[23px] w-full items-center justify-center pr-1" href={`/products?category=${title}`}>
              See all
              <FontAwesomeIcon className="inline h-4 w-4 text-color" icon={faChevronRight} />
            </a>
          </div>
        </div>
      )}

      <div className="flex w-full flex-wrap">
        {listProducts?.map((itemProduct, index) => {
          return (
            <ProductItem className={`${className}`} key={`${itemProduct._id}${index}`} itemProduct={itemProduct} />
          );
        })}
      </div>
    </div>
  );
};

export { ListProducts };
