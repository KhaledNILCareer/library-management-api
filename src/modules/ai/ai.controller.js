import { summarizeBook } from "./ai.service.js";

export const summarizeBookController = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const summary = await summarizeBook(title, description);

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