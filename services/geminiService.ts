import { CaptionAndHashtags, ProductHooks } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const callApiProxy = async (payload: object) => {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Gagal memproses respons error dari server.' }));
        throw new Error(errorData.error || 'Terjadi kesalahan pada server.');
    }

    return response.json();
}

export const generateCaptionAndHashtags = async (
  productType: string,
  detailedRequest?: string,
  productImageFile?: File,
  productDescription?: string,
  descriptionImageFile?: File,
): Promise<CaptionAndHashtags> => {
  
  const payload = {
    type: 'caption',
    params: {
      productType,
      detailedRequest,
      productDescription,
      productImage: productImageFile ? {
        base64: await fileToBase64(productImageFile),
        mimeType: productImageFile.type,
      } : undefined,
      descriptionImage: descriptionImageFile ? {
        base64: await fileToBase64(descriptionImageFile),
        mimeType: descriptionImageFile.type,
      } : undefined,
    }
  };
  
  return callApiProxy(payload);
};

export const generateProductHooks = async (
  productName: string,
  targetAudience?: string,
  features?: string,
  hookReference?: string,
): Promise<ProductHooks> => {
   const payload = {
     type: 'hook',
     params: {
       productName,
       targetAudience,
       features,
       hookReference,
     }
   };
   
   return callApiProxy(payload);
};
