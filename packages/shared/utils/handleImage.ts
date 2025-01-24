import type { UploadFileType } from '..';

function getBlobFileHeader(blob: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      if (!e.target?.result) {
        reject(new Error('File is invalid'));

        return;
      }
      const arr = new Uint8Array(e.target?.result as ArrayBufferLike).subarray(0, 4);
      let headerString = '';
      for (let i = 0; i < arr.length; i += 1) {
        if (!arr[i]) {
          reject(new Error('File is invalid'));

          return;
        }
        headerString += (arr[i] as number).toString(16);
      }

      resolve(headerString);
    };

    fileReader.readAsArrayBuffer(blob);
  });
}

function getMimeType(headerString: string): string {
  let type: string;
  switch (headerString) {
    case '89504e47':
      type = 'image/png';
      break;
    case '47494638':
      type = 'image/gif';
      break;
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
      type = 'image/jpeg';
      break;
    case '52494646':
      type = 'image/webp';
      break;
    default:
      type = 'unknown';
      break;
  }

  return type;
}

export const getFileType = async (blob: File) => {
  try {
    const headerString = await getBlobFileHeader(blob);
    const type = getMimeType(headerString);

    return type;
  } catch (error) {
    throw new Error('Reading file header error');
  }
};

export const isValidImageFile = async (file: File, type: UploadFileType) => {
  const fileType = await getFileType(file);

  let allowedExtensions = /(\/jpg|\/jpeg|\/png|\/webp)$/i;

  if (type === 'Artwork') {
    allowedExtensions = /(\/jpg|\/jpeg|\/png|\/webp)$/i;
  } else if (type === 'Mockup') {
    allowedExtensions = /(\/jpg|\/jpeg|\/png|\/webp)$/i;
  } else if (type === 'Product_Image') {
    allowedExtensions = /(\/jpg|\/jpeg|\/png|\/webp)$/i;
  } else {
    allowedExtensions = /(\/jpg|\/jpeg|\/png|\/webp)$/i;
  }

  if (!allowedExtensions.test(fileType)) {
    return false;
  }

  return true;
};

export const getImageSize = async (objectUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      img.remove();
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = objectUrl;
  });
};
