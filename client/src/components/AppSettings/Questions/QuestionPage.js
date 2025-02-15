import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../../reducers/questionSlice';
import { fetchSubjects } from '../../../reducers/subjectSlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';
import QuestionForm from './QuestionForm';
import ConfirmModal from '../../ConfirmModal';
import QuestionTable from './QuestionTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const QuestionPage = () => {
  const dispatch = useDispatch();
  const { questions, loading, error } = useSelector((state) => state.questions);
  const { subjects } = useSelector((state) => state.subjects);
  const { subscriptions } = useSelector((state) => state.subscription);

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [questionData, setQuestionData] = useState({
    subject_id: '',
    question: '',
    question_text: '',
    answer_options: '',
    correct_answer: '',
    difficulty: '',
    explanation: '',
    subscription_id: '',
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    question_text: '',
    subject: '',
    subscription: '',
    difficulty: '',
    addedBy: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchSubjects());
    dispatch(getSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(`Error: ${error}`);
  }, [error]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  const resetForm = () => {
    setQuestionData({
      subject_id: '',
      question: '',
      question_text: '',
      answer_options: '',
      correct_answer: '',
      difficulty: '',
      explanation: '',
      subscription_id: '',
    });
    setEditingQuestion(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleRowClick = (id) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter((q) => q !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedQuestions([]);
      setAllSelected(false);
    } else {
      const allIds = filteredQuestions.map((q) => q._id);
      setSelectedQuestions(allIds);
      setAllSelected(true);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionData.subject_id) {
      toast.error('Subject is required.');
      return;
    }
    if (!questionData.question) {
      toast.error('Question is required.');
      return;
    }
    if (!questionData.question_text) {
      toast.error('Question Text is required.');
      return;
    }
    if (!questionData.answer_options) {
      toast.error('Answer options are required.');
      return;
    }
    if (!questionData.correct_answer) {
      toast.error('Correct answer is required.');
      return;
    }
    const payload = {
      ...questionData,
      answer_options: questionData.answer_options.split(',').map((s) => s.trim()),
    };
    try {
      await dispatch(createQuestion(payload));
      dispatch(fetchQuestions());
      closeModal();
    } catch {}
  };

  const handleUpdateQuestion = async () => {
    if (!questionData.subject_id) {
      toast.error('Subject is required.');
      return;
    }
    if (!questionData.question) {
      toast.error('Question is required.');
      return;
    }
    if (!questionData.question_text) {
      toast.error('Question Text is required.');
      return;
    }
    if (!questionData.answer_options) {
      toast.error('Answer options are required.');
      return;
    }
    if (!questionData.correct_answer) {
      toast.error('Correct answer is required.');
      return;
    }
    const payload = {
      ...questionData,
      answer_options: questionData.answer_options.split(',').map((s) => s.trim()),
    };
    try {
      await dispatch(updateQuestion({ id: editingQuestion._id, questionData: payload }));
      dispatch(fetchQuestions());
      closeModal();
    } catch {}
  };

  const handleDeleteQuestions = async () => {
    try {
      for (const id of selectedQuestions) {
        await dispatch(deleteQuestion(id));
      }
      dispatch(fetchQuestions());
      setSelectedQuestions([]);
      setAllSelected(false);
      setShowConfirmDelete(false);
    } catch {}
  };

  const handleEditClick = (question) => {
    const opts = Array.isArray(question.answer_options)
      ? question.answer_options.join(', ')
      : question.answer_options || '';
    setQuestionData({
      subject_id:
        (question.subject_id && question.subject_id._id) ||
        question.subject_id ||
        '',
      question: question.question || '',
      question_text: question.question_text || '',
      answer_options: opts,
      correct_answer: question.correct_answer || '',
      difficulty: question.difficulty || '',
      explanation: question.explanation || '',
      subscription_id:
        (question.subscription_id && question.subscription_id._id) ||
        question.subscription_id ||
        '',
    });
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const filteredQuestions = questions.filter((q) => {
    let match = true;
    if (columnFilters.question_text && !q.question_text.toLowerCase().includes(columnFilters.question_text.toLowerCase())) {
      match = false;
    }
    if (columnFilters.subject) {
      let subjName = '';
      if (q.subject_id && typeof q.subject_id === 'object') {
        subjName = q.subject_id.name || '';
      }
      if (!subjName.toLowerCase().includes(columnFilters.subject.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.subscription) {
      let subName = '';
      if (q.subscription_id && typeof q.subscription_id === 'object') {
        subName = q.subscription_id.name || '';
      }
      if (!subName.toLowerCase().includes(columnFilters.subscription.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.difficulty && !q.difficulty.toLowerCase().includes(columnFilters.difficulty.toLowerCase())) {
      match = false;
    }
    if (columnFilters.addedBy) {
      if (!q.addedBy || !q.addedBy.toLowerCase().includes(columnFilters.addedBy.toLowerCase())) {
        match = false;
      }
    }
    return match;
  });

  const totalPages = Math.ceil(filteredQuestions.length / recordsPerPage);
  const displayedQuestions = filteredQuestions.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container">
      <h2>Manage Questions</h2>

      {/* Top Action Buttons Row */}
      <div className="d-flex justify-content-between mb-2">
        <button
          className={`btn btn-danger ${selectedQuestions.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedQuestions.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {/* Pagination Controls (top right) */}
      <div className="d-flex justify-content-end mb-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Question Table */}
      <QuestionTable
        questions={displayedQuestions}
        selectedQuestions={selectedQuestions}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
      />

      {/* Pagination Controls (bottom right) */}
      <div className="d-flex justify-content-end mt-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedQuestions.length} question(s)?`}
          onConfirm={handleDeleteQuestions}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <QuestionForm
                  isEditing={!!editingQuestion}
                  data={questionData}
                  setData={setQuestionData}
                  onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                  isSubmitting={false}
                  onCancel={closeModal}
                  allSubjects={subjects}
                  allSubscriptions={subscriptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </div>
  );
};

export default QuestionPage;