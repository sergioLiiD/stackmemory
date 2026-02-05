
import { GoogleGenerativeAI, GenerativeModel, GenerateContentRequest, GenerateContentResult, GenerateContentStreamResult } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const PRIMARY_MODEL = "gemini-2.0-flash";
export const FALLBACK_MODEL = "gemini-1.5-flash";

export async function safeGenerateContent(
    options: {
        systemInstruction?: string,
        contents: any[], // Simple contents for generateContent
        generationConfig?: any
    }
): Promise<{ result: GenerateContentResult; modelUsed: string }> {
    try {
        console.log(`GEMINI: Attempting with ${PRIMARY_MODEL}`);
        const model = genAI.getGenerativeModel({
            model: PRIMARY_MODEL,
            systemInstruction: options.systemInstruction
        });
        const result = await model.generateContent(options.contents);
        return { result, modelUsed: PRIMARY_MODEL };
    } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
            console.warn(`GEMINI: ${PRIMARY_MODEL} rate limited. Falling back to ${FALLBACK_MODEL}`);
            const fallbackModel = genAI.getGenerativeModel({
                model: FALLBACK_MODEL,
                systemInstruction: options.systemInstruction
            });
            const result = await fallbackModel.generateContent(options.contents);
            return { result, modelUsed: FALLBACK_MODEL };
        }
        throw error;
    }
}

export async function safeGenerateContentStream(
    options: {
        systemInstruction?: string,
        contents: any[],
        generationConfig?: any
    }
): Promise<{ result: GenerateContentStreamResult; modelUsed: string }> {
    try {
        console.log(`GEMINI STREAM: Attempting with ${PRIMARY_MODEL}`);
        const model = genAI.getGenerativeModel({
            model: PRIMARY_MODEL,
            systemInstruction: options.systemInstruction
        });
        const result = await model.generateContentStream(options.contents);
        return { result, modelUsed: PRIMARY_MODEL };
    } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
            console.warn(`GEMINI STREAM: ${PRIMARY_MODEL} rate limited. Falling back to ${FALLBACK_MODEL}`);
            const fallbackModel = genAI.getGenerativeModel({
                model: FALLBACK_MODEL,
                systemInstruction: options.systemInstruction
            });
            const result = await fallbackModel.generateContentStream(options.contents);
            return { result, modelUsed: FALLBACK_MODEL };
        }
        throw error;
    }
}
