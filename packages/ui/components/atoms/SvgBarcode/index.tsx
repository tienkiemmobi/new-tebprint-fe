import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

type SvgBarcodeProps = {
  value: string;
  classes?: string;
  format?: string; // Optional barcode format (default: 'CODE128')
  width?: number; // Optional barcode width
  height?: number; // Optional barcode height
};

const SvgBarcode: React.FC<SvgBarcodeProps> = ({ value, format = 'CODE128', width = 200, height = 100, classes }) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (value && barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format,
        height,
      });
    }
  }, [value, format, width, height]);

  return <svg className={classes} ref={barcodeRef} />;
};

export { SvgBarcode };
