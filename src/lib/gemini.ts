
import { GoogleGenerativeAI, GenerativeModel, GenerateContentRequest, GenerateContentResult, GenerateContentStreamResult } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// HACKATHON MODELS (Latest Series 1.5/2.0)
export const PRIMARY_MODEL_PRO = "gemini-1.5-pro";
export const PRIMARY_MODEL_FLASH = "gemini-1.5-flash";

// STABLE MODELS (Reliable Series 2.0)
export const STABLE_MODEL_PRO = "gemini-2.0-flash-exp";
export const STABLE_MODEL_FLASH = "gemini-2.0-flash";

// LEGACY FALLBACK
export const FALLBACK_MODEL = "gemini-2.0-flash";

/**
 * Standard content generation with multiple fallback layers.
 */
export async function safeGenerateContent(
    options: {
        model?: string,
        systemInstruction?: string,
        contents: any[],
        generationConfig?: any
    }
): Promise<{ result: GenerateContentResult; modelUsed: string }> {
    const primaryModel = options.model || PRIMARY_MODEL_PRO;

    try {
        console.log(`GEMINI: Attempting with ${primaryModel}`);
        const model = genAI.getGenerativeModel({
            model: primaryModel,
            systemInstruction: options.systemInstruction
        });
        const result = await model.generateContent(options.contents);
        return { result, modelUsed: primaryModel };
    } catch (error: any) {
        const isRetryable =
            error.message?.includes('429') ||
            error.message?.includes('Resource exhausted') ||
            error.message?.includes('503') ||
            error.message?.includes('Service Unavailable');

        if (isRetryable) {
            const fallbackModelName = primaryModel.includes('pro') ? STABLE_MODEL_PRO : STABLE_MODEL_FLASH;
            console.warn(`GEMINI: ${primaryModel} failed (${error.message}). Falling back to ${fallbackModelName}`);
            const fallbackModel = genAI.getGenerativeModel({
                model: fallbackModelName,
                systemInstruction: options.systemInstruction
            });
            const result = await fallbackModel.generateContent(options.contents);
            return { result, modelUsed: fallbackModelName };
        }
        throw error;
    }
}

/**
 * Streaming content generation with multiple fallback layers.
 */
export async function safeGenerateContentStream(
    options: {
        model?: string,
        systemInstruction?: string,
        contents: any[],
        generationConfig?: any
    }
): Promise<{ result: GenerateContentStreamResult; modelUsed: string }> {
    const primaryModel = options.model || PRIMARY_MODEL_PRO;

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
            // Determine fallback: Pro -> Stable Pro -> Fallback
            let nextModel = STABLE_MODEL_PRO;
            if (primaryModel === STABLE_MODEL_PRO) nextModel = STABLE_MODEL_FLASH;
            else if (primaryModel === STABLE_MODEL_FLASH) nextModel = FALLBACK_MODEL;
            else if (primaryModel.includes('flash')) nextModel = STABLE_MODEL_FLASH;

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
