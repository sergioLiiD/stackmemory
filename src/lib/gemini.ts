
import { GoogleGenerativeAI, GenerativeModel, GenerateContentRequest, GenerateContentResult, GenerateContentStreamResult } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const PRIMARY_MODEL = "gemini-3.1-pro-preview";
export const SECONDARY_MODEL = "gemini-3-flash-preview";
export const FALLBACK_MODEL = "gemini-2.0-flash";

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
        const isRetryable =
            error.message?.includes('429') ||
            error.message?.includes('Resource exhausted') ||
            error.message?.includes('503') ||
            error.message?.includes('Service Unavailable');

        if (isRetryable) {
            console.warn(`GEMINI: ${PRIMARY_MODEL} failed. Falling back to ${SECONDARY_MODEL}`);
            const fallbackModel = genAI.getGenerativeModel({
                model: SECONDARY_MODEL,
                systemInstruction: options.systemInstruction
            });
            const result = await fallbackModel.generateContent(options.contents);
            return { result, modelUsed: SECONDARY_MODEL };
        }
        throw error;
    }
}

export async function safeGenerateContentStream(
    options: {
        model?: string,
        systemInstruction?: string,
        contents: any[],
        generationConfig?: any
    }
): Promise<{ result: GenerateContentStreamResult; modelUsed: string }> {
    const primaryModel = options.model || PRIMARY_MODEL;
    try {
        console.log(`GEMINI STREAM: Attempting with ${primaryModel}`);
        const model = genAI.getGenerativeModel({
            model: primaryModel,
            systemInstruction: options.systemInstruction
        });
        const result = await model.generateContentStream(options.contents);
        return { result, modelUsed: primaryModel };
    } catch (error: any) {
        const isRetryable =
            error.message?.includes('429') ||
            error.message?.includes('Resource exhausted') ||
            error.message?.includes('503') ||
            error.message?.includes('Service Unavailable');

        if (isRetryable) {
            const nextModel = primaryModel === PRIMARY_MODEL ? SECONDARY_MODEL : FALLBACK_MODEL;
            console.warn(`GEMINI STREAM: ${primaryModel} failed (${error.message}). Falling back to ${nextModel}`);
            const fallbackModel = genAI.getGenerativeModel({
                model: nextModel,
                systemInstruction: options.systemInstruction
            });
            const result = await fallbackModel.generateContentStream(options.contents);
            return { result, modelUsed: nextModel };
        }
        throw error;
    }
}
