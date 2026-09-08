import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  BookMarked,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Calendar,
  RefreshCw,
  Trash2,
  Edit3,
  Info,
  AlertTriangle,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { formatDate } from '../../utils/formatters';

export function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'issues'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState(null);

  // Add Book Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [category, setCategory] = useState('Competitive Exams');
  const [copies, setCopies] = useState('5');
  const [shelfLocation, setShelfLocation] = useState('Shelf A-1');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);

  // Edit Book Form state
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editIsbn, setEditIsbn] = useState('');
  const [editPublisher, setEditPublisher] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCopies, setEditCopies] = useState('1');
  const [editShelfLocation, setEditShelfLocation] = useState('');
  const [editCoverFile, setEditCoverFile] = useState(null);

  // Issue Form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  // Load live data from server
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, issuesRes, studentsRes] = await Promise.all([
        api.books.getAll({ limit: 100 }),
        api.books.getIssues(),
        api.students.getAll({ limit: 100 })
      ]);

      if (booksRes.success) {
        setBooks(booksRes.data?.books || []);
      } else {
        setError(booksRes.message || 'Failed to load books catalog');
      }

      if (issuesRes.success) {
        setIssues(issuesRes.data?.issues || []);
      }

      if (studentsRes.success) {
        setStudents(studentsRes.data?.students || []);
      }
    } catch (err) {
      setError(err.message || 'Network error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Book
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    const payload = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim() || undefined,
      publisher: publisher.trim() || undefined,
      category: category.trim() || 'General',
      totalCopies: parseInt(copies, 10) || 1,
      shelfLocation: shelfLocation.trim() || undefined,
      description: description.trim() || undefined
    };

    try {
      const res = await api.books.add(payload, coverFile);
      if (res.success) {
        setActionSuccess(res.message || 'Book added to catalog successfully');
        setIsAddBookModalOpen(false);
        setTitle('');
        setAuthor('');
        setIsbn('');
        setPublisher('');
        setDescription('');
        setCoverFile(null);
        await loadData();
      } else {
        setActionError(res.message || 'Failed to add book');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to add book');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (book) => {
    setSelectedBookForEdit(book);
    setEditTitle(book.title || '');
    setEditAuthor(book.author || '');
    setEditIsbn(book.ISBN || book.isbn || '');
    setEditPublisher(book.publisher || '');
    setEditCategory(book.category || '');
    setEditCopies(String(book.totalCopies || 1));
    setEditShelfLocation(book.shelfLocation || '');
    setEditCoverFile(null);
    setIsEditBookModalOpen(true);
  };

  // Update Book
  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!selectedBookForEdit) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    const payload = {
      title: editTitle.trim(),
      author: editAuthor.trim(),
      isbn: editIsbn.trim() || undefined,
      publisher: editPublisher.trim() || undefined,
      category: editCategory.trim() || undefined,
      totalCopies: parseInt(editCopies, 10) || 1,
      shelfLocation: editShelfLocation.trim() || undefined
    };

    try {
      const res = await api.books.update(selectedBookForEdit._id, payload, editCoverFile);
      if (res.success) {
        setActionSuccess(res.message || 'Book updated successfully');
        setIsEditBookModalOpen(false);
        setSelectedBookForEdit(null);
        await loadData();
      } else {
        setActionError(res.message || 'Failed to update book');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update book');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book from inventory?")) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.books.delete(bookId);
      if (res.success) {
        setActionSuccess(res.message || 'Book deleted successfully');
        await loadData();
      } else {
        setActionError(res.message || 'Failed to delete book');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to delete book');
    } finally {
      setActionLoading(false);
    }
  };

  // Issue Book
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookForIssue || !selectedStudentId) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.books.issue({
        bookId: selectedBookForIssue._id,
        studentId: selectedStudentId,
        dueDate
      });

      if (res.success) {
        setActionSuccess(res.message || 'Book issued successfully');
        setIsIssueModalOpen(false);
        setSelectedBookForIssue(null);
        setSelectedStudentId('');
        await loadData();
      } else {
        setActionError(res.message || 'Failed to issue book');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to issue book');
    } finally {
      setActionLoading(false);
    }
  };

  // Return Book
  const handleReturnBook = async (issueId) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.books.returnBook(issueId);
      if (res.success) {
        setActionSuccess('Book marked as returned.');
        await loadData();
      } else {
        setActionError(res.message || 'Failed to process book return.');
      }
    } catch (err) {
      setActionError(`Return failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Books List
  const filteredBooks = books.filter(b => {
    if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = b.title?.toLowerCase().includes(term);
      const matchAuthor = b.author?.toLowerCase().includes(term);
      const matchIsbn = (b.ISBN || b.isbn || '').toLowerCase().includes(term);
      if (!matchTitle && !matchAuthor && !matchIsbn) return false;
    }
    return true;
  });

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(books.map(b => b.category).filter(Boolean)))];
  const activeIssuedBooks = issues.filter(i => i.status === 'issued');

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Reference Book Catalog</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage library reference books, catalog copies, track lending, and monitor active issues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 shadow-2xs"
            title="Reload live book inventory from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Action Alerts */}
      {actionError && (
        <div className="bg-rose-50/50 border border-rose-200 text-rose-900 p-3 rounded-md flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-neutral-50 border border-neutral-200 text-neutral-900 p-3 rounded-md flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Load Error */}
      {error && (
        <div className="bg-rose-50/50 border border-rose-200 text-rose-900 p-3.5 rounded-md flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <span className="font-semibold block">Error loading book catalog from server:</span>
            <span className="text-rose-700">{error}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-neutral-200 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2 text-xs font-medium transition-all border-b-2 ${
              activeTab === 'catalog'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Book Inventory ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`pb-2 text-xs font-medium transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'issues'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <span>Circulation Log ({issues.length})</span>
            {activeIssuedBooks.length > 0 && (
              <span className="px-1.5 py-0.2 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-full text-[10px] font-mono">
                {activeIssuedBooks.length} Active
              </span>
            )}
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search title, author, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            {categories.length > 2 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-medium text-neutral-700"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Tab 1: Book Inventory Catalog */}
      {activeTab === 'catalog' && (
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400 bg-white rounded-lg border border-neutral-200 shadow-2xs">
              <RefreshCw className="w-6 h-6 animate-spin mb-2" />
              <span className="text-xs">Loading live book catalog...</span>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 bg-white rounded-lg border border-neutral-200 shadow-2xs space-y-2">
              <BookOpen className="w-8 h-8 mx-auto stroke-1 text-neutral-300" />
              <p className="text-sm font-semibold text-neutral-700">No books found</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {books.length === 0
                  ? "Your catalog is empty. Click 'Add New Book' to register your first reference book."
                  : "No books match your current search criteria."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => {
                const hasCopies = (book.availableCopies ?? 0) > 0;
                const bookIsbn = book.ISBN || book.isbn;
                const coverImg = book.image?.url || book.coverImage;

                return (
                  <div
                    key={book._id}
                    className="bg-white rounded-lg p-4 border border-neutral-200 shadow-2xs flex flex-col justify-between hover:border-neutral-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                          {book.category || 'General'}
                        </span>
                        {book.shelfLocation && (
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {book.shelfLocation}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={book.title}
                            className="w-14 h-20 object-cover rounded border border-neutral-200 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-20 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2" title={book.title}>
                            {book.title}
                          </h3>
                          <div className="text-xs text-neutral-500 mt-0.5 truncate">By {book.author || 'Unknown'}</div>
                          {bookIsbn && (
                            <div className="text-[10px] text-neutral-400 font-mono mt-1 truncate">
                              ISBN: {bookIsbn}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-neutral-400 block text-[10px]">Availability</span>
                        <span className={`font-mono font-medium ${hasCopies ? 'text-emerald-700' : 'text-neutral-400'}`}>
                          {book.availableCopies ?? 0} / {book.totalCopies ?? 0} Available
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(book)}
                          title="Edit Book Details"
                          className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          disabled={actionLoading}
                          title="Delete Book"
                          className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={!hasCopies}
                          onClick={() => {
                            setSelectedBookForIssue(book);
                            setIsIssueModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors ml-1"
                        >
                          Issue
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Circulation Log / Issues */}
      {activeTab === 'issues' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-700">
              Lending & Circulation History
            </h3>
            <span className="text-xs text-neutral-400 font-mono">Total Issues: {issues.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-medium">
                <tr>
                  <th className="py-2.5 px-3.5">Book Title</th>
                  <th className="py-2.5 px-3.5">Issued To</th>
                  <th className="py-2.5 px-3.5">Issue Date</th>
                  <th className="py-2.5 px-3.5">Due Date</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Overdue Fine</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-neutral-400">
                      No circulation issues found on record.
                    </td>
                  </tr>
                ) : (
                  issues.map((iss) => {
                    const bookTitle = iss.bookTitle || iss.bookId?.title || 'Unknown Book';
                    const studentDisplay = iss.studentName || iss.studentId?.name || (iss.studentId?.studentId ? `Student (${iss.studentId.studentId})` : 'Student');
                    const studentSub = iss.studentPhone || iss.studentId?.studentId || '';
                    const isReturned = iss.status === 'returned';

                    return (
                      <tr key={iss._id} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-3.5 font-medium text-neutral-900">{bookTitle}</td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-medium text-neutral-800">{studentDisplay}</div>
                          {studentSub && <div className="text-[10px] text-neutral-400 font-mono">{studentSub}</div>}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-neutral-600">{formatDate(iss.issueDate)}</td>
                        <td className="py-2.5 px-3.5 font-mono text-neutral-600">{formatDate(iss.dueDate)}</td>
                        <td className="py-2.5 px-3.5">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize font-medium ${
                            isReturned
                              ? 'bg-neutral-100 text-neutral-900 border-neutral-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {iss.status || 'issued'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          {(iss.fineAmount > 0 || iss.fine > 0) ? (
                            <span className="font-mono font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              ₹{iss.fineAmount || iss.fine} Fine
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-mono">₹0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {isReturned ? (
                            <span className="text-emerald-700 font-medium text-[11px]">Returned</span>
                          ) : (
                            <button
                              onClick={() => handleReturnBook(iss._id)}
                              disabled={actionLoading}
                              title="Process Return via live API"
                              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white rounded font-medium text-[11px] transition-colors"
                            >
                              {actionLoading ? 'Processing...' : 'Process Return'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add Book */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-neutral-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Add Book to Inventory</h3>
                <span className="text-[11px] text-neutral-500">Register book in library catalog</span>
              </div>
              <button onClick={() => setIsAddBookModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Book Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Indian Polity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Author *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. M. Laxmikanth"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Total Copies *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">ISBN Number</label>
                  <input
                    type="text"
                    placeholder="978-9355325013"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Competitive Exams"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Publisher</label>
                  <input
                    type="text"
                    placeholder="McGraw Hill India"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Shelf Location</label>
                  <input
                    type="text"
                    placeholder="Shelf A-1"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Cover Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-md shadow-xs"
                >
                  {actionLoading ? 'Adding...' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Book */}
      {isEditBookModalOpen && selectedBookForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-neutral-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Edit Book Details</h3>
                <span className="text-[11px] text-neutral-500">Update catalog and copy inventory</span>
              </div>
              <button onClick={() => setIsEditBookModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBook} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Book Title *</label>
                <input
                  required
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Author *</label>
                  <input
                    required
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Total Copies *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={editCopies}
                    onChange={(e) => setEditCopies(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">ISBN Number</label>
                  <input
                    type="text"
                    value={editIsbn}
                    onChange={(e) => setEditIsbn(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Publisher</label>
                  <input
                    type="text"
                    value={editPublisher}
                    onChange={(e) => setEditPublisher(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={editShelfLocation}
                    onChange={(e) => setEditShelfLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Replace Cover Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                  className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditBookModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-md shadow-xs"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Issue Book */}
      {isIssueModalOpen && selectedBookForIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-lg border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Issue Reference Book</h3>
                <span className="text-[11px] text-neutral-500">Assign book copy to enrolled student</span>
              </div>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs">
                <div className="font-medium text-neutral-900">{selectedBookForIssue.title}</div>
                <div className="text-neutral-500 text-[11px] mt-0.5">By {selectedBookForIssue.author}</div>
                <div className="text-[10px] text-neutral-600 font-mono mt-1">
                  Copies Available: {selectedBookForIssue.availableCopies ?? 0}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Issue to Student *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-medium text-neutral-700"
                >
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Return Due Date *</label>
                <input
                  required
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedStudentId}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-md shadow-xs"
                >
                  {actionLoading ? 'Issuing...' : 'Confirm Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

