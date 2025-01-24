import { RotateCcw, XCircle } from 'lucide-react';
import React from 'react';
import type { ImageControlItem, ImageControlType } from 'shared';

export type ImageMockUpItemProps = {
  imageStyles?: string;
  closeStyle?: string;
  handleChoosePreview?: (id: string) => void;
  handleDeleteItem: (id: string) => void;
  handleReUpload: (id: string, type?: ImageControlType) => void;
  isMainImage?: boolean;
} & ImageControlItem;

const ImageMockUpItem = ({
  id,
  imageUrl,
  isChecked,
  handleChoosePreview,
  handleDeleteItem,
  isMainImage,
  imagePreviewUrl,
  status,
  handleReUpload,
  type,
  imageStyles = '',
  closeStyle = '',
}: ImageMockUpItemProps) => {
  const handleClickDelete = React.useCallback((e: React.MouseEvent<SVGSVGElement, MouseEvent>, idChoose: string) => {
    e.stopPropagation();
    handleDeleteItem(idChoose);
  }, []);

  const handlePreviewImage = React.useCallback(
    (idPreview: string, imageUrlPreview: string) => {
      if (!imageUrlPreview) return;

      if (handleChoosePreview) handleChoosePreview(idPreview);
    },
    [handleChoosePreview],
  );

  return (
    <div
      className="group/image relative inline-flex w-fit cursor-pointer flex-col gap-2"
      onClick={() => handlePreviewImage(id, imageUrl)}
    >
      {imageUrl && handleChoosePreview && (
        <input
          type="radio"
          name="radio-3"
          className="dsy-radio-secondary dsy-radio absolute left-1 top-1"
          checked={isChecked}
          onChange={() => {}}
        />
      )}

      <img
        src={imageUrl || imagePreviewUrl}
        alt="image item"
        height={96}
        width={96}
        className={`h-24 w-24 rounded-[3px] object-cover shadow ${imageStyles} ${imageUrl ? '' : 'blur-[1px]'} ${
          isChecked ? 'border-[3px] border-[#29ab51]' : 'border border-[#c4c7c8]'
        }`}
      />
      {/* {type !== 'mockups' && <p className="text-center text-sm">{type.toUpperCase()}</p>} */}

      {/* Mark as main image */}
      {isMainImage && (
        <div className="absolute right-[-5px] top-[-5px] z-10 h-[50px] w-[50px] overflow-hidden text-right">
          <span className="absolute right-[-32px] top-[12px] block w-[100px] rotate-45 bg-primary from-green-400 to-green-700 text-center text-xs font-bold uppercase leading-5 shadow-2xl">
            Main
          </span>
        </div>
      )}

      {status === 'Rejected' && (
        <RotateCcw
          className="absolute bottom-1/2 right-1/2 z-10 h-6 w-6 translate-x-1/2 translate-y-1/2 scale-125 cursor-pointer rounded bg-orange-500 p-1 text-background hover:opacity-80"
          onClick={() => {
            if (handleReUpload) handleReUpload(id, type);
          }}
        />
      )}

      <XCircle
        className={`absolute right-1 top-1 z-10 hidden h-6 w-6 cursor-pointer text-background transition-all group-hover/image:block ${closeStyle}`}
        onClick={(e) => handleClickDelete(e, id)}
      />
    </div>
  );
};

export { ImageMockUpItem };
