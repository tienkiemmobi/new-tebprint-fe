/* eslint-disable @typescript-eslint/naming-convention */
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as heart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import type { Product } from 'shared';

type ProductItemProps = {
  itemProduct?: Product;
  className?: string;
};

const ProductItem = (props: ProductItemProps) => {
  const { itemProduct, className } = props;
  if (!itemProduct) return <></>;
  const { _id, title, price, mainImage } = itemProduct;
  const [isLiked, setIsLiked] = React.useState<boolean>(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className={`${className}`} product-item="true">
      <div className="w-64 rounded-xl p-2 hover:shadow-xl hover:ring-2 hover:ring-secondary">
        <a href={`/product/${_id}`} className="block">
          <div className="relative">
            <img className="h-64 w-full rounded-xl border border-gray-200" src={mainImage} />
            <span className="absolute left-4 top-[22px] rounded-[3px] border border-white bg-accent px-2 py-[2px] text-sm font-medium leading-5 text-green-400">
              New
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleLike();
              }}
              className="absolute right-4 top-[20px] flex h-10 w-10 items-center justify-center rounded-[50%] border bg-white focus:outline-none"
            >
              {isLiked ? (
                <FontAwesomeIcon className="h-6 w-6 text-primary" icon={heart} />
              ) : (
                <FontAwesomeIcon className="h-6 w-6 text-inherit hover:text-primary" icon={faHeart} />
              )}
            </button>
          </div>
          <div className="p-1">
            <p className="truncate pt-2 hover:text-primary">{title}</p>
            <p className="pt-1 text-slate-500">From ${price ? price.toFixed(2) : 0}</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export { ProductItem };
