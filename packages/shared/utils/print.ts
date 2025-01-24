export const printImage = (imageUrl: string, options: Record<string, any> = {}): void => {
  const settings: Record<string, any> = {
    name: '_blank',
    specs: ['fullscreen=yes', 'titlebar=yes', 'scrollbars=yes'],
    replace: true,
    styles: [],
    ...options,
  };

  const windowName = settings.name;
  const windowSpecs = settings.specs?.length ? settings.specs.join(',') : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Document</title>
      </head>
      <body>
        <div style="text-align: center;">
          <img src="${imageUrl}">
        </div>
      </body>
    </html>
  `;

  const newWindow = window.open('', windowName, windowSpecs);
  if (newWindow) {
    newWindow.document.write(htmlContent);
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      setTimeout(() => {
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
        newWindow.close();
      }, 1500);
    };
  }
};

export const printPDF = (pdfBase64: string, options: Record<string, any> = {}): void => {
  const settings: Record<string, any> = {
    name: '_blank',
    specs: ['fullscreen=yes', 'titlebar=yes', 'scrollbars=yes'],
    replace: true,
    styles: [],
    ...options,
  };

  const windowName = settings.name;
  const windowSpecs = settings.specs?.length ? settings.specs.join(',') : '';

  const pdfContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Document</title>
      </head>
      <body>
        <embed src="${pdfBase64}" type="application/pdf" width="100%" height="1000px" style="max-height: 96vh">
      </body>
    </html>
  `;

  const newWindow = window.open('', windowName, windowSpecs);
  if (newWindow) {
    newWindow.document.write(pdfContent);
    newWindow.onload = () => {
      setTimeout(() => {
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
        newWindow.close();
      }, 1500);
    };
  }
};
