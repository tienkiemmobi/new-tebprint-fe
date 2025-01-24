declare module 'onscan.js' {
  interface ScanResponse {
    detail: ScanEvent;
  }

  interface ScanEvent {
    scanCode: string;
    quantity: number;
  }

  const attachTo: (element: HTMLElement | Document, options?: any) => EventListenerOrEventListenerObject;

  const detachFrom: (element: HTMLElement | Document, options?: any) => EventListenerOrEventListenerObject;

  const decodeKeyEvent: (oEvent: KeyboardEvent) => EventListenerOrEventListenerObject;

  export { attachTo, decodeKeyEvent, detachFrom, type ScanEvent, type ScanResponse };
}
