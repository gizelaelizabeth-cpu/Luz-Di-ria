
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Devotional, QuickInspiration, WordStudy } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDailyDevotional = async (): Promise<Devotional> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Gere um devocional cristão inspirador para hoje em português. Escolha um tema relevante como paz, esperança, amor ou perseverança.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          verse: { type: Type.STRING },
          reference: { type: Type.STRING },
          content: { type: Type.STRING },
          reflection: { type: Type.STRING },
          prayer: { type: Type.STRING },
        },
        required: ["title", "verse", "reference", "content", "reflection", "prayer"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
};

export const generateNotificationPhrase = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Gere uma frase cristã curta (máximo 60 caracteres) e impactante para uma notificação de bom dia. Ex: 'Deus preparou um dia lindo para você!'.",
    });
    return response.text?.trim() || "Deus tem algo novo para você hoje!";
  } catch {
    return "Que a paz do Senhor esteja com você hoje.";
  }
};

export const generateQuickInspiration = async (): Promise<QuickInspiration> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Gere um versículo bíblico curto e uma frase motivacional cristã curta para o dia de hoje.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verse: { type: Type.STRING },
          ref: { type: Type.STRING },
          phrase: { type: Type.STRING }
        },
        required: ["verse", "ref", "phrase"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateWordStudy = async (): Promise<WordStudy> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: "Escolha uma palavra bíblica importante (ex: Graça, Shalom, Agape) e explique seu significado no original e aplicação.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          original: { type: Type.STRING },
          meaning: { type: Type.STRING },
          application: { type: Type.STRING }
        },
        required: ["word", "original", "meaning", "application"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getBiblePassage = async (book: string, chapters: string): Promise<{ text: string, context: string }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Forneça o texto bíblico de ${book} ${chapters} na versão NVI e uma breve explicação devocional de 2 parágrafos.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          context: { type: Type.STRING }
        },
        required: ["text", "context"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const suggestPrayer = async (topic: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Escreva uma oração cristã profunda e sincera baseada neste motivo: "${topic}". Seja empático e bíblico.`,
  });
  return response.text || "Senhor, abençoa este pedido e guia meus passos segundo a Tua vontade. Amém.";
};

export const generateAudioFromText = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Leia com calma e serenidade este devocional: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    return undefined;
  }
};

export const decodePCM = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
