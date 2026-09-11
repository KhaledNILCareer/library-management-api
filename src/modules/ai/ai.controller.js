import { summarizeBook } from "./ai.service.js";

export const summarizeBookController = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (
      typeof title !== "string" ||
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    if (trimmedDescription.length > 5000) {
      return res.status(400).json({
        message: "Description must not exceed 5000 characters",
      });
    }

    const summary = await summarizeBook(
      trimmedTitle,
      trimmedDescription
    );

    res.status(200).json({
      message: "Book summarized successfully",
      data: {
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};