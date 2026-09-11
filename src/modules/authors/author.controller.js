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
  } catch (err) { next(err); }
};

export const getAuthors = async (req, res, next) => {
  try {

    const authors = await Author.find();
    res.status(200).json(
      {
        "message": "Authors retrieved successfully",
        "data": authors
      }
    );
  } catch (err) { next(err) }
};

export const getAuthorById = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.status(200).json(
      {
        "message": "Author retrieved successfully",
        "data": author
      }
    );
    
  } catch (err) { next(err) }
};

export const updateAuthor = async (req, res, next) => {
  try {
    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedAuthor) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.status(200).json(
      {
        "message": "Author updated successfully",
        "data": updatedAuthor
      }
    );
    
  } catch (err) { next(err) }
};