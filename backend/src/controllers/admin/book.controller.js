const { Book, BookIssue, Student } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Add new book
 * @route   POST /api/v1/admin/books
 * @access  Private (Admin)
 */
exports.addBook = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { title, author, isbn, publisher, category, totalCopies, shelfLocation, description } = req.body;
    
    let coverImage = null;
    if (req.file) {
      coverImage = req.file.path;
    }
    
    const book = new Book({
      adminId, title, author, isbn, publisher, category,
      totalCopies, availableCopies: totalCopies,
      shelfLocation, description, coverImage
    });
    
    await book.save();
    return sendSuccess(res, 201, 'Book added', { book });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get all books
 * @route   GET /api/v1/admin/books
 * @access  Private (Admin)
 */
exports.getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const query = { adminId: req.user.id };
    
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }
    
    const books = await Book.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Book.countDocuments(query);
    
    return sendSuccess(res, 200, 'Books retrieved', {
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get book by ID
 * @route   GET /api/v1/admin/books/:id
 * @access  Private (Admin)
 */
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!book) return sendError(res, 404, 'Book not found');
    return sendSuccess(res, 200, 'Book retrieved', { book });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update book
 * @route   PUT /api/v1/admin/books/:id
 * @access  Private (Admin)
 */
exports.updateBook = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.coverImage = req.file.path;
    }
    
    const book = await Book.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!book) return sendError(res, 404, 'Book not found');
    
    if (updates.totalCopies) {
      const diff = updates.totalCopies - book.totalCopies;
      updates.availableCopies = book.availableCopies + diff;
      if (updates.availableCopies < 0) return sendError(res, 400, 'Available copies cannot be negative');
    }
    
    Object.assign(book, updates);
    await book.save();
    
    return sendSuccess(res, 200, 'Book updated', { book });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Delete book
 * @route   DELETE /api/v1/admin/books/:id
 * @access  Private (Admin)
 */
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!book) return sendError(res, 404, 'Book not found');
    
    const activeIssues = await BookIssue.countDocuments({ bookId: book._id, status: 'issued' });
    if (activeIssues > 0) return sendError(res, 400, 'Cannot delete book with active issues');
    
    await book.deleteOne();
    return sendSuccess(res, 200, 'Book deleted');
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Issue book
 * @route   POST /api/v1/admin/books/issue
 * @access  Private (Admin)
 */
exports.issueBook = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { bookId, studentId, dueDate } = req.body;
    
    const book = await Book.findOne({ _id: bookId, adminId });
    if (!book) return sendError(res, 404, 'Book not found');
    if (book.availableCopies <= 0) return sendError(res, 400, 'No copies available');
    
    const student = await Student.findOne({ _id: studentId, adminId });
    if (!student) return sendError(res, 404, 'Student not found');
    
    const issue = new BookIssue({
      adminId, bookId, studentId, dueDate
    });
    
    book.availableCopies -= 1;
    await book.save();
    await issue.save();
    
    return sendSuccess(res, 201, 'Book issued', { issue });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Return book
 * @route   POST /api/v1/admin/books/return/:issueId
 * @access  Private (Admin)
 */
exports.returnBook = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { finePaid = 0 } = req.body;
    
    const issue = await BookIssue.findOne({ _id: req.params.issueId, adminId, status: 'issued' });
    if (!issue) return sendError(res, 404, 'Active book issue not found');
    
    const book = await Book.findOne({ _id: issue.bookId, adminId });
    
    // Fine calc
    const now = new Date();
    let fineAmount = 0;
    if (now > issue.dueDate) {
      const daysOverdue = Math.ceil((now - issue.dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * 10; // example: 10 per day
    }
    
    issue.returnDate = now;
    issue.status = 'returned';
    issue.fineAmount = fineAmount;
    
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }
    
    await issue.save();
    return sendSuccess(res, 200, 'Book returned', { issue, fineAmount });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get book issues
 * @route   GET /api/v1/admin/books/issues
 * @access  Private (Admin)
 */
exports.getBookIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { adminId: req.user.id };
    if (status) query.status = status;
    
    const issues = await BookIssue.find(query)
      .populate('bookId', 'title author isbn')
      .populate('studentId', 'firstName lastName studentId')
      .sort('-issueDate');
      
    return sendSuccess(res, 200, 'Book issues retrieved', { issues });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
