/* eslint-disable no-console */
import './styles.css';

// @ts-ignore
import Quagga from 'quagga';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const config = {
  inputStream: {
    type: 'LiveStream',
    constraints: {
      width: { min: 450 },
      height: { min: 300 },
      facingMode: 'environment',
      aspectRatio: { min: 1, max: 2 },
    },
  },
  locator: {
    patchSize: 'medium',
    halfSample: true,
  },
  numOfWorkers: 2,
  frequency: 10,
  decoder: {
    readers: ['code_128_reader'],
  },
  locate: true,
};

type ScannerProps = {
  onDetected: (value: string) => Promise<void>;
};

const Scanner = (props: ScannerProps) => {
  const { onDetected } = props;

  useEffect(() => {
    try {
      const sCodes: string[] = [];
      Quagga.init(config, (err: any) => {
        if (err) {
          console.log(err, 'error msg');
        }
        Quagga.start();

        return () => {
          Quagga.stop();
        };
      });

      // detecting boxes on stream
      Quagga.onProcessed((result: any) => {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
          if (result.boxes) {
            drawingCtx.clearRect(
              0,
              0,
              Number(drawingCanvas.getAttribute('width')),
              Number(drawingCanvas.getAttribute('height')),
            );
            result.boxes
              .filter((box: any) => {
                return box !== result.box;
              })
              .forEach((box: any) => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                  color: 'green',
                  lineWidth: 2,
                });
              });
          }

          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
              color: '#00F',
              lineWidth: 2,
            });
          }

          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
          }
        }
      });

      Quagga.onDetected(async (result: any) => {
        if (!result.codeResult.code) return;

        const specialCharacters = ['%'];
        if (specialCharacters.includes(result.codeResult.code)) return;

        if (!sCodes.includes(result.codeResult.code)) {
          setTimeout(() => {
            sCodes.splice(0, sCodes.length);
          }, 5000);

          sCodes.push(result.codeResult.code);
          await onDetected(result.codeResult.code);
        }
      });
    } catch (error) {
      console.error('Error accessing the camera: ', error);

      toast.error('Error accessing the camera');
    }
  }, []);

  return (
    // If you do not specify a target,
    // QuaggaJS would look for an element that matches
    // the CSS selector #interactive.viewport
    <div id="interactive" className="viewport" />
  );
};

export { Scanner };
