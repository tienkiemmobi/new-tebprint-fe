const download = (pdf: string, fileName: string, baseHead: string) => {
  const linkSource = pdf.includes(baseHead) ? pdf : `${baseHead},${pdf}`;
  const downloadLink = document.createElement('a');
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  downloadLink.click();
  downloadLink.remove();

  return linkSource;
};

export function downloadPDF(pdf: string, fileName: string) {
  const baseHead = `data:application/pdf;base64`;

  return download(pdf, fileName, baseHead);
}

export function downloadPngImage(pdf: string, fileName: string) {
  const baseHead = `data:image/png;base64`;

  return download(pdf, fileName, baseHead);
}
