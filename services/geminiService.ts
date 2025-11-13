import { GoogleGenAI, Type, Part } from "@google/genai";
import { CaptionAndHashtags, ProductHooks } from '../types';

// Utility function to convert a File object to a base64 string
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            resolve(''); // Should not happen with readAsDataURL
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


export const generateCaptionAndHashtags = async (
  productType: string,
  detailedRequest?: string,
  productImageFile?: File,
  productDescription?: string,
  descriptionImageFile?: File,
): Promise<CaptionAndHashtags> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const promptParts: Part[] = [];

  let textPrompt = `Kamu adalah seorang copywriter media sosial yang handal. Tugasmu adalah menganalisis informasi produk dan membuat caption yang menjual dengan gaya bahasa yang sangat membumi, santai, dan mudah dimengerti (seperti sedang mengobrol dengan teman).

**Informasi Produk:**
- **Jenis Produk:** "${productType}"
`;

  if (productDescription) {
    textPrompt += `- **Deskripsi Produk (dari teks):** "${productDescription}"\n`;
  }
  if (detailedRequest) {
    textPrompt += `- **Permintaan Khusus (gaya bahasa):** "${detailedRequest}"\n`;
  }

  textPrompt += `
**Instruksi Penting:**
- **Gaya Bahasa:** WAJIB membumi, santai, gaul, dan persuasif. Hindari bahasa yang kaku atau formal.
- **Format Output:** Berikan output HANYA dalam format JSON: {"caption": "...", "hashtags": ["...", "..."]}.
- **Hashtag:** Buat daftar hashtag yang relevan dan populer terkait produk.`;

  promptParts.push({ text: textPrompt });

  if (productImageFile) {
      promptParts.push({ text: "\nIni adalah foto produknya:" });
      promptParts.push(await fileToGenerativePart(productImageFile));
  }

  if (descriptionImageFile) {
      promptParts.push({ text: "\nIni adalah screenshot deskripsi produk untuk konteks tambahan:" });
      promptParts.push(await fileToGenerativePart(descriptionImageFile));
  }


  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      caption: {
        type: Type.STRING,
        description: "Caption produk yang dihasilkan.",
      },
      hashtags: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "Hashtag yang relevan."
        },
        description: "Array berisi hashtag yang relevan.",
      },
    },
    required: ["caption", "hashtags"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: promptParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonString = response.text.trim();
    const parsedResult: CaptionAndHashtags = JSON.parse(jsonString);
    
    // Basic validation
    if (!parsedResult.caption || !Array.isArray(parsedResult.hashtags)) {
        throw new Error("Struktur JSON dari API tidak valid.");
    }

    return parsedResult;

  } catch (error) {
    console.error("Error saat memanggil Gemini API:", error);
    throw new Error("Gagal membuat konten. Cek konsol untuk detail lebih lanjut.");
  }
};

export const generateProductHooks = async (
  productName: string,
  targetAudience?: string,
  features?: string,
  hookReference?: string,
): Promise<ProductHooks> => {
   if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let prompt = `Kamu adalah seorang ahli marketing yang jago bikin penasaran. Berdasarkan detail produk berikut, buatkan 10 'hook' marketing yang kreatif dan ngena banget. Hook adalah kalimat pendek yang catchy untuk menarik perhatian pelanggan.

**Gaya Bahasa:** Buat hook dengan gaya yang sangat membumi, santai, dan gampang diingat. Anggap saja kamu sedang merekomendasikan produk ini ke teman baikmu.

**Detail Produk:**
- **Nama Produk:** "${productName}"
`;

  if (targetAudience) {
    prompt += `\n- **Target Audiens:** "${targetAudience}"`;
  }
  if (features) {
    prompt += `\n- **Fitur Unggulan:** "${features}"`;
  }
  if (hookReference) {
    prompt += `\n- **Referensi Gaya Hook:** "${hookReference}"`;
  }

  prompt += `

**Instruksi Penting:**
- **Format Output:** Berikan output HANYA dalam format JSON: {"hooks": ["hook 1", "hook 2", ..., "hook 10"]}.
- **Kualitas Hook:** Hook harus singkat, nampol, bikin penasaran, dan sesuai dengan detail yang diberikan.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      hooks: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "Sebuah hook marketing yang menarik."
        },
        description: "Array berisi 10 hook marketing yang menarik.",
      },
    },
    required: ["hooks"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonString = response.text.trim();
    const parsedResult: ProductHooks = JSON.parse(jsonString);

    if (!Array.isArray(parsedResult.hooks)) {
      throw new Error("Struktur JSON dari API tidak valid.");
    }
    
    return parsedResult;
  } catch (error) {
    console.error("Error saat memanggil Gemini API:", error);
    throw new Error("Gagal membuat hook. Cek konsol untuk detail lebih lanjut.");
  }
};