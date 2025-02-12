import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../../reducers/questionSlice';
import { fetchSubjects } from '../../../reducers/subjectSlice';

// Import your existing subscription action
import { getSubscriptions } from '../../../auth/subscriptionActions';

import QuestionForm from './QuestionForm';
import ConfirmModal from '../../ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const QuestionPage = () => {
  const dispatch = useDispatch();
  const { questions, loading, error } = useSelector((state) => state.questions);
  const { subjects } = useSelector((state) => state.subjects);
  const { subscriptions } = useSelector((state) => state.subscription);

  // For multi-select to delete
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // question form data
  const [questionData, setQuestionData] = useState({
    subject_id: '',
    question: '',
    question_text: '',
    answer_options: '',
    correct_answer: '',
    difficulty: '',
    explanation: '',
    subscription_id: '', // NEW
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Fetch questions, subjects, subscriptions on mount
  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchSubjects());
    dispatch(getSubscriptions());
  }, [dispatch]);

  // Display errors from Redux
  useEffect(() => {
    if (error) toast.error(`Error: ${error}`);
  }, [error]);

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

  // Toggle selection for bulk delete
  const handleRowClick = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  // Bulk Delete
  const handleDeleteQuestions = async () => {
    try {
      for (const id of selectedQuestions) {
        await dispatch(deleteQuestion(id));
      }
      dispatch(fetchQuestions());
      toast.success(`${selectedQuestions.length} question(s) deleted!`);
      setSelectedQuestions([]);
      setShowConfirmDelete(false);
    } catch {
      // error handled in Redux
    }
  };

  // Add a new question
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
    } catch {
      // error in Redux
    }
  };

  // Edit
  const handleEditClick = (question) => {
    const opts = Array.isArray(question.answer_options)
      ? question.answer_options.join(', ')
      : question.answer_options || '';

    setQuestionData({
      subject_id:
        (question.subject_id && question.subject_id._id) || question.subject_id || '',
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

  // Update
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
      await dispatch(
        updateQuestion({ id: editingQuestion._id, questionData: payload })
      );
      dispatch(fetchQuestions());
      closeModal();
    } catch {
      // error handled in Redux
    }
  };

  return (
    <div className="container">
      <h2>Manage Questions</h2>

      {/* Top Action Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn btn-danger ${
            selectedQuestions.length === 0 ? 'disabled' : ''
          }`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedQuestions.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Selected
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Question
        </button>
      </div>

      {/* TABLE - showing fields including subscription if you want */}
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject</th>
            <th>Question</th>
            <th>Question Text</th>
            <th>Answer Options</th>
            <th>Correct Answer</th>
            <th>Difficulty</th>
            <th>Subscription</th> {/* NEW column if you want to display it */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="text-center">
                Loading questions...
              </td>
            </tr>
          ) : questions.length > 0 ? (
            questions.map((q) => {
              const opts = Array.isArray(q.answer_options)
                ? q.answer_options.join(', ')
                : q.answer_options || '';

              let subscriptionLabel = '—';
              if (q.subscription_id) {
                subscriptionLabel =
                  typeof q.subscription_id === 'object'
                    ? q.subscription_id.name
                    : q.subscription_id;
              }

              return (
                <tr
                  key={q._id}
                  className={selectedQuestions.includes(q._id) ? 'table-primary' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q._id)}
                      onChange={() => handleRowClick(q._id)}
                    />
                  </td>
                  <td>
                    {q.subject_id && typeof q.subject_id === 'object'
                      ? q.subject_id.name
                      : q.subject_id}
                  </td>
                  <td>{q.question}</td>
                  <td>{q.question_text}</td>
                  <td>{opts}</td>
                  <td>{q.correct_answer}</td>
                  <td>{q.difficulty || '—'}</td>
                  <td>{subscriptionLabel}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEditClick(q)}
                      style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                      title="Edit"
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No questions available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedQuestions.length} question(s)?`}
          onConfirm={handleDeleteQuestions}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}

      {/* Add/Edit Modal */}
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
                  isSubmitting={false} // or pass loading if you want
                  onCancel={closeModal}
                  allSubjects={subjects}
                  // Pass subscriptions to the form
                  allSubscriptions={subscriptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
