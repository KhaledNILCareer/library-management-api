import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const summarizeBook = async (title, description) => {
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: `
      Generate a short and clear summary for the following book.

      Book title: ${title}
      Description: ${description}

      Return only the summary.
    `,
  });

  return interaction.output_text;
};