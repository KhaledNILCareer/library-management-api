import Author from './author.model.js';

export const createAuthor = async (req, res, next) => {
  try {
    const { name, biography } = req.body;

    const author = await Author.create({ name, biography });
    

    res.status(201).json(
      {
        "message": "Author created successfully",
        "data": author
      }
    );
  } catch (err) {
    next(err);
  }
};


