import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_TIMEOUT_MS = 10000;

export const summarizeBook = async (title, description) => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("AI service configuration error");
    error.statusCode = 500;
    throw error;
  }

  let timeoutId;

  try {
    const geminiRequest = ai.interactions.create({
      model: "gemini-3.6-flash",
      input: `
        Generate a short and clear summary for the following book.

        Book title: ${title}
        Description: ${description}

        Return only the summary.
      `,
    });

    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error("AI service request timed out");
        error.statusCode = 504;
        reject(error);
      }, GEMINI_TIMEOUT_MS);
    });

    const interaction = await Promise.race([
      geminiRequest,
      timeout,
    ]);

    const summary = interaction.output_text?.trim();

    if (!summary) {
      const error = new Error("AI service returned an empty response");
      error.statusCode = 502;
      throw error;
    }

    return summary;
  } catch (error) {
    if ([502, 504].includes(error.statusCode)) {
      throw error;
    }

    if (
      error.name === "AuthenticationError" ||
      error.status === 401 ||
      error.statusCode === 401
    ) {
      const authError = new Error("AI service configuration error");
      authError.statusCode = 500;
      throw authError;
    }

    if (error.status === 429 || error.statusCode === 429) {
      const rateLimitError = new Error(
        "AI service is temporarily unavailable"
      );
      rateLimitError.statusCode = 503;
      throw rateLimitError;
    }

    if (
      (error.status >= 500 && error.status <= 599) ||
      (error.statusCode >= 500 && error.statusCode <= 599)
    ) {
      const serviceError = new Error(
        "AI service is temporarily unavailable"
      );
      serviceError.statusCode = 502;
      throw serviceError;
    }

    const serviceError = new Error("AI service request failed");
    serviceError.statusCode = 502;
    throw serviceError;
  } finally {
    clearTimeout(timeoutId);
  }
};