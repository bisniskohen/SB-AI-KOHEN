import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Part } from "@google/genai";

// Mendefinisikan tipe data langsung di sini untuk menghindari masalah path saat Vercel build
interface CaptionAndHashtags {
  caption: string;
  hashtags: string[];
}

interface ProductHooks {
  hooks: string[];
}

interface ImagePayload {
    base64: string; // Data URL format
    mimeType: string;
}

const getBase64Data = (dataUrl: string) => dataUrl.split(',')[1];

async function generateCaption(ai: GoogleGenAI, params: any): Promise<CaptionAndHashtags> {
    const { 
        productType, 
        detailedRequest, 
        productImage, 
        productDescription, 
        descriptionImage 
    } = params as {
        productType: string;
        detailedRequest?: string;
        productDescription?: string;
        productImage?: ImagePayload;
        descriptionImage?: ImagePayload;
    };

    const promptParts: Part[] = [];
    let textPrompt = `Kamu adalah seorang copywriter media sosial yang handal. Tugasmu adalah menganalisis informasi produk dan membuat caption yang menjual dengan gaya bahasa yang sangat membumi, santai, dan mudah dimengerti (seperti sedang mengobrol dengan teman).

**Informasi Produk:**
- **Jenis Produk:** "${productType}"
`;

    if (productDescription) textPrompt += `- **Deskripsi Produk (dari teks):** "${productDescription}"\n`;
    if (detailedRequest) textPrompt += `- **Permintaan Khusus (gaya bahasa):** "${detailedRequest}"\n`;
    textPrompt += `
**Instruksi Penting:**
- **Gaya Bahasa:** WAJIB membumi, santai, gaul, dan persuasif. Hindari bahasa yang kaku atau formal.
- **Format Output:** Berikan output HANYA dalam format JSON: {"caption": "...", "hashtags": ["...", "..."]}.
- **Hashtag:** Buat daftar hashtag yang relevan dan populer terkait produk.`;

    promptParts.push({ text: textPrompt });

    if (productImage) {
        promptParts.push({ text: "\nIni adalah foto produknya:" });
        promptParts.push({ inlineData: { data: getBase64Data(productImage.base64), mimeType: productImage.mimeType } });
    }

    if (descriptionImage) {
        promptParts.push({ text: "\nIni adalah screenshot deskripsi produk untuk konteks tambahan:" });
        promptParts.push({ inlineData: { data: getBase64Data(descriptionImage.base64), mimeType: descriptionImage.mimeType } });
    }

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["caption", "hashtags"],
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: promptParts },
        config: { responseMimeType: "application/json", responseSchema },
    });
    
    return JSON.parse(response.text.trim()) as CaptionAndHashtags;
}

async function generateHooks(ai: GoogleGenAI, params: any): Promise<ProductHooks> {
    const { productName, targetAudience, features, hookReference } = params as {
        productName: string;
        targetAudience?: string;
        features?: string;
        hookReference?: string;
    };

    let prompt = `Kamu adalah seorang ahli marketing yang jago bikin penasaran. Berdasarkan detail produk berikut, buatkan 10 'hook' marketing yang kreatif dan ngena banget. Hook adalah kalimat pendek yang catchy untuk menarik perhatian pelanggan.

**Gaya Bahasa:** Buat hook dengan gaya yang sangat membumi, santai, dan gampang diingat. Anggap saja kamu sedang merekomendasikan produk ini ke teman baikmu.

**Detail Produk:**
- **Nama Produk:** "${productName}"
`;
    if (targetAudience) prompt += `\n- **Target Audiens:** "${targetAudience}"`;
    if (features) prompt += `\n- **Fitur Unggulan:** "${features}"`;
    if (hookReference) prompt += `\n- **Referensi Gaya Hook:** "${hookReference}"`;
    prompt += `

**Instruksi Penting:**
- **Format Output:** Berikan output HANYA dalam format JSON: {"hooks": ["hook 1", "hook 2", ..., "hook 10"]}.
- **Kualitas Hook:** Hook harus singkat, nampol, bikin penasaran, dan sesuai dengan detail yang diberikan.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["hooks"],
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema },
    });

    return JSON.parse(response.text.trim()) as ProductHooks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable is not set on the server.");
        return res.status(500).json({ error: "Konfigurasi server tidak lengkap. API Key tidak ditemukan." });
    }
  
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { type, params } = req.body;

    try {
        let result;
        if (type === 'caption') {
            result = await generateCaption(ai, params);
        } else if (type === 'hook') {
            result = await generateHooks(ai, params);
        } else {
            return res.status(400).json({ error: 'Jenis permintaan tidak valid.' });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in Gemini API call from proxy:", error);
        return res.status(500).json({ error: "Terjadi kesalahan saat berkomunikasi dengan AI." });
    }
}
