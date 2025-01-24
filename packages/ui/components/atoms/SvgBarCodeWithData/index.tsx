/* eslint-disable new-cap */
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { ArrowDownToLine, Printer } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { toast } from 'react-toastify';

type SvgBarcodeProps = {
  value: string;
  lineItem?: string;
  isShowValue?: boolean;
  format?: string; // Optional barcode format (default: 'CODE128')
  width?: number; // Optional barcode width
  height?: number; // Optional barcode height
  name?: string;
  numberInOrder?: string;
  color?: string;
  date?: string;
  orderId?: string;
  isShowDownloadButton?: boolean;
  isShowDownloadButtonText?: boolean;
  isShowPrintButton?: boolean;
  isShowOnlyDownloadBarCodeButton?: boolean;
  canvasClass?: string;
  productCode?: string;
  packageCode?: string;
  packageName?: string;
};

export type SvgBarcodeRef = {
  downloadBarcode: () => void;
  printBarcode: () => void;
};

const SvgBarcodeWithData = forwardRef<SvgBarcodeRef, SvgBarcodeProps>((props, ref) => {
  const {
    value,
    lineItem,
    isShowValue = true,
    format = 'CODE128',
    width = 200,
    height = 200,
    name,
    numberInOrder,
    color,
    date,
    orderId,
    isShowDownloadButton = true,
    isShowDownloadButtonText = true,
    isShowPrintButton = true,
    canvasClass = '',
    productCode,
    packageCode,
    packageName,
    isShowOnlyDownloadBarCodeButton = true,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasOnlyRef = useRef<HTMLCanvasElement | null>(null);
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const barcodeOnlyRef = useRef<SVGSVGElement | null>(null);

  // const handleDownloadPngFile = () => {
  //   if (canvasRef.current) {
  //     // Get the canvas image data as a data URL
  //     const canvasDataUrl = canvasRef.current.toDataURL('image/png');

  //     // Create a temporary link element to trigger the download
  //     const link = document.createElement('a');
  //     link.href = canvasDataUrl;
  //     link.download = 'barcode.png'; // You can customize the filename
  //     link.click();
  //   }
  // };

  const handleDownload = async () => {
    if (canvasRef.current) {
      const imgData = canvasRef.current.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF();

      pdf.addImage(imgData, 'JPEG', 0, 0, 70, 25);

      const fileName = `barcode_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    }
  };

  const handleDownloadOnlyBarcode = async () => {
    if (canvasOnlyRef.current) {
      const imgData = canvasOnlyRef.current.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF();

      pdf.addImage(imgData, 'JPEG', 0, 0, 70, 25);

      const fileName = `barcode_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    }
  };

  const handlePrint = async () => {
    if (canvasRef.current) {
      const imgData = canvasRef.current.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'JPEG', 0, 0, 70, 25);

      // Generate the PDF as a base64 encoded string
      const pdfData = pdf.output('datauristring');

      // Create an object with the base64 string
      const requestData = {
        file: pdfData,
        orderId,
        barcode: value,
        paperSize: 'A6',
      };

      try {
        // Send the PDF as a POST request to the server using Axios
        const response = await axios.post('http://localhost:3011/print', requestData, {
          headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
          },
        });

        if (response.status === 200) {
          toast.success('Print success');
        } else {
          // eslint-disable-next-line no-console
          console.log(response);
          toast.error('Print fail');
        }
      } catch (error) {
        toast.error('Print error');
      }
    }
  };

  useImperativeHandle(ref, () => ({
    downloadBarcode() {
      handleDownload();
    },
    printBarcode() {
      handlePrint();
    },
  }));

  useEffect(() => {
    if (value && barcodeRef.current && canvasRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format,
        height,
        displayValue: false,
      });

      // Get the SVG content as a data URL
      const svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(barcodeRef.current.outerHTML)}`;
      const img = new Image();
      const canvas = document.getElementById('canvasId') as HTMLCanvasElement;
      const canvasWidth = canvas?.width;

      // Create an image from the SVG data
      img.src = svgData;

      // Draw the image on the canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        img.onload = () => {
          // draw background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height + 20);
          if (!orderId && !date && !name && !color) ctx.drawImage(img, 0, 10, width, 100);
          else ctx.drawImage(img, 0, 45, width, 100);

          // Draw the item name above the barcode
          ctx.font = '12px Arial'; // Customize the font style
          ctx.textAlign = 'center';
          ctx.fillStyle = 'black';
          if (value) ctx.fillText(`${value}` || '', canvasWidth / 2, 157);
          if (isShowValue || name || numberInOrder) {
            const text = ` ${name || ''} ${name && isShowValue ? '/' : ''} ${isShowValue ? value : ''} ${
              numberInOrder || ''
            }`;
            ctx.fillText(text, canvasWidth / 2, 20);
          }
          if (date) ctx.fillText(date || '', 140, 40); // Index of products in order
          if (productCode) ctx.fillText(productCode || '', canvas.width - 20, 180);
          if (color) ctx.fillText(color || '', canvas.width - 20, 205); // Index of products in order
          ctx.fillText(packageCode || '', 37, 180);
          ctx.fillText(packageName || '', 70, 205);

          ctx.font = '15px Arial'; // Customize the font style
        };
        barcodeRef.current.remove();
      }
    }
    if (value && barcodeOnlyRef.current && canvasOnlyRef.current) {
      JsBarcode(barcodeOnlyRef.current, value, {
        format,
        height,
      });

      // Get the SVG content as a data URL
      const svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(barcodeOnlyRef.current.outerHTML)}`;
      const img = new Image();
      // const canvas = document.getElementById('canvasId') as HTMLCanvasElement;

      // Create an image from the SVG data
      img.src = svgData;

      // Draw the image on the canvas
      const ctx = canvasOnlyRef.current.getContext('2d');
      if (ctx) {
        img.onload = () => {
          // draw background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height + 20);
          if (!orderId && !date && !name && !color) ctx.drawImage(img, 0, 10, width, 100);
          else ctx.drawImage(img, 0, 45, width, 100);
        };
        barcodeOnlyRef.current.remove();
      }
    }
  }, [value, format, width, height]);

  return (
    <div className="flex w-full flex-row flex-wrap justify-center lg:justify-between">
      <canvas id="canvasId" ref={canvasRef} width={width} height={height + 20} className={canvasClass}></canvas>
      <canvas
        id="canvasId"
        ref={canvasOnlyRef}
        width={width}
        height={height + 20}
        className={`${canvasClass} hidden`}
      ></canvas>
      <svg ref={barcodeOnlyRef} className="hidden" />
      <svg ref={barcodeRef} className="hidden" />

      <div className="flex flex-col items-end justify-center">
        {isShowDownloadButton && (
          <div>
            <button className="flex gap-2 rounded py-2" onClick={() => handleDownload()}>
              {isShowDownloadButtonText && 'Full barcode'}
              <ArrowDownToLine />
            </button>
          </div>
        )}
        {isShowOnlyDownloadBarCodeButton && (
          <div>
            <button className="flex gap-2 rounded py-2" onClick={() => handleDownloadOnlyBarcode()}>
              Barcode only
              <ArrowDownToLine />
            </button>
          </div>
        )}

        {isShowPrintButton && (
          <div>
            <button id={lineItem} className="rounded py-2" onClick={() => handlePrint()}>
              <Printer />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export { SvgBarcodeWithData };
