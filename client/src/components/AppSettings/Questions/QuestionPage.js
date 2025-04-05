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
import QuestionTable from './QuestionTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

// Utility functions for subscription level conversion
function normalizeSubName(rawName) {
  if (!rawName) return '';
  return rawName.trim().toLowerCase();
}

function getSubLevel(rawName) {
  const name = normalizeSubName(rawName);
  switch (name) {
    case 'free': return 1;
    case 'standard': return 2;
    case 'enterprise': return 3;
    default: return 0;
  }
}

const QuestionPage = () => {
  const dispatch = useDispatch();
  const { questions, loading, error } = useSelector((state) => state.questions);
  const { subjects } = useSelector((state) => state.subjects);
  const { subscriptions } = useSelector((state) => state.subscription);
  const { profile } = useSelector((state) => state.auth);

  const isSuperadmin = profile?.role?.toLowerCase() === 'superadmin';
  const organization = profile?.organization;
  const subscriptionId = organization?.subscription?._id;

  // For local admins, subscription is auto-set; for superadmin, leave empty initially.
  const initialSubscription = isSuperadmin ? '' : subscriptionId || '';

  // Global/Local tab state
  const [activeTab, setActiveTab] = useState('global');

  // Form state for add/edit question
  const [questionData, setQuestionData] = useState({
    subject_id: '',
    short_text: '',
    full_text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_answer: '',
    difficulty: 'Medium',
    explanation: '',
    subscription_id: initialSubscription,
  });

  // Filter subjects for selection based on role:
  // - Superadmin: For global tab, show only subjects with creatorRole "superadmin" that match the selected subscription.
  // - Local admin: Show only subjects with creatorRole "admin" and matching ownerOrgId.
  const filteredSubjects = isSuperadmin
    ? subjects.filter((subj) => {
        if (activeTab === 'global') {
          if (!questionData.subscription_id) return false;
          const subjSubId =
            subj.subscription_id && typeof subj.subscription_id === 'object'
              ? subj.subscription_id._id.toString()
              : subj.subscription_id;
          return subjSubId === questionData.subscription_id && subj.creatorRole === 'superadmin';
        } else {
          return subj.creatorRole === 'admin';
        }
      })
    : subjects.filter(
        (subj) =>
          subj.creatorRole === 'admin' &&
          subj.ownerOrgId &&
          subj.ownerOrgId.toString() === organization._id.toString()
      );

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [columnFilters, setColumnFilters] = useState({
    question_number: '',
    short_text: '',
    full_text: '',
    explanation: '',
    answer_options: '',
    correct_answer: '',
    difficulty: '',
    subject: '',
    subscription: '',
    addedBy: '',
    createdAt: '',
    updatedAt: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(getSubscriptions());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, activeTab]);

  const resetForm = () => {
    setQuestionData({
      subject_id: '',
      short_text: '',
      full_text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correct_answer: '',
      difficulty: 'Medium',
      explanation: '',
      subscription_id: isSuperadmin ? '' : subscriptionId || '',
    });
    setEditingQuestion(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleEditClick = (question) => {
    const [optA, optB, optC, optD] = question.answer_options || ['', '', '', ''];
    setQuestionData({
      subject_id: question.subject_id ? (question.subject_id._id || question.subject_id) : '',
      short_text: question.short_text || '',
      full_text: question.full_text || '',
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correct_answer: question.correct_answer || '',
      difficulty: question.difficulty || 'Medium',
      explanation: question.explanation || '',
      subscription_id: question.subscription_id
        ? (question.subscription_id._id || question.subscription_id)
        : (isSuperadmin ? '' : subscriptionId),
    });
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleAddQuestion = async () => {
    if (!questionData.subject_id) {
      toast.error('Subject is required.');
      return;
    }
    if (!questionData.optionA || !questionData.optionB || !questionData.optionC || !questionData.optionD) {
      toast.error('All four options (A, B, C, D) are required.');
      return;
    }
    if (!questionData.correct_answer) {
      toast.error('Correct answer is required.');
      return;
    }

    let addedBy = 'Cybernack';
    if (profile.role === 'admin' && organization.name && organization.name !== 'Cybernack') {
      addedBy = organization.name;
    }

    const payload = {
      subject_id: questionData.subject_id,
      short_text: questionData.short_text,
      full_text: questionData.full_text,
      answer_options: [
        questionData.optionA,
        questionData.optionB,
        questionData.optionC,
        questionData.optionD,
      ],
      correct_answer: questionData.correct_answer,
      difficulty: questionData.difficulty || 'Medium',
      explanation: questionData.explanation || '',
      addedBy,
    };

    if (isSuperadmin) {
      if (!questionData.subscription_id) {
        toast.error('Subscription is required for global questions.');
        return;
      }
      payload.subscription_id = questionData.subscription_id;
    } else {
      payload.subscription_id = subscriptionId;
    }

    try {
      await dispatch(createQuestion(payload));
      closeModal();
      setCurrentPage(1);
    } catch {
      toast.error('Failed to create question.');
    }
  };

  const handleUpdateQuestion = async () => {
    if (!questionData.subject_id) {
      toast.error('Subject is required.');
      return;
    }
    if (!questionData.optionA || !questionData.optionB || !questionData.optionC || !questionData.optionD) {
      toast.error('All four options are required.');
      return;
    }
    if (!questionData.correct_answer) {
      toast.error('Correct answer is required.');
      return;
    }

    let addedBy = editingQuestion.addedBy || 'Cybernack';
    if (profile.role === 'admin' && organization.name && organization.name !== 'Cybernack') {
      addedBy = organization.name;
    }

    const payload = {
      subject_id: questionData.subject_id,
      short_text: questionData.short_text,
      full_text: questionData.full_text,
      answer_options: [
        questionData.optionA,
        questionData.optionB,
        questionData.optionC,
        questionData.optionD,
      ],
      correct_answer: questionData.correct_answer,
      difficulty: questionData.difficulty,
      explanation: questionData.explanation,
      addedBy,
    };

    if (isSuperadmin) {
      if (!questionData.subscription_id) {
        toast.error('Subscription is required for global questions.');
        return;
      }
      payload.subscription_id = questionData.subscription_id;
    } else {
      payload.subscription_id = subscriptionId;
    }

    try {
      await dispatch(updateQuestion({ id: editingQuestion._id, questionData: payload }));
      closeModal();
    } catch {
      toast.error('Failed to update question.');
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedQuestions.length) return;
    if (!window.confirm(`Delete ${selectedQuestions.length} question(s)?`)) return;
    for (const id of selectedQuestions) {
      await dispatch(deleteQuestion(id));
    }
    setSelectedQuestions([]);
    setAllSelected(false);
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

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  // --- Filter questions based on Global/Local tab ---
  const filteredQuestions = questions.filter((q) => {
    let match = true;
    if (activeTab === 'global') {
      // Global questions: subject's creatorRole must be 'superadmin'
      if (!(q.subject_id && typeof q.subject_id === 'object' && q.subject_id.creatorRole === 'superadmin')) {
        match = false;
      }
    } else {
      // Local questions:
      if (isSuperadmin) {
        // For superadmin viewing local questions: subject.creatorRole should be 'admin'
        if (!(q.subject_id && typeof q.subject_id === 'object' && q.subject_id.creatorRole === 'admin')) {
          match = false;
        }
      } else {
        // For local admin: subject.creatorRole must be 'admin' and question.ownerOrgId must match the admin's org.
        if (!(q.subject_id && typeof q.subject_id === 'object' && q.subject_id.creatorRole === 'admin')) {
          match = false;
        }
        if (!q.ownerOrgId || q.ownerOrgId.toString() !== organization._id.toString()) {
          match = false;
        }
      }
    }
    // Apply other column filters
    if (columnFilters.question_number && !q.question_number?.toLowerCase().includes(columnFilters.question_number.toLowerCase())) {
      match = false;
    }
    if (columnFilters.short_text && !q.short_text?.toLowerCase().includes(columnFilters.short_text.toLowerCase())) {
      match = false;
    }
    if (columnFilters.full_text && !q.full_text?.toLowerCase().includes(columnFilters.full_text.toLowerCase())) {
      match = false;
    }
    if (columnFilters.explanation && !q.explanation?.toLowerCase().includes(columnFilters.explanation.toLowerCase())) {
      match = false;
    }
    if (columnFilters.answer_options) {
      const joinedOpts = Array.isArray(q.answer_options) ? q.answer_options.join(' ').toLowerCase() : '';
      if (!joinedOpts.includes(columnFilters.answer_options.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.correct_answer && !q.correct_answer?.toLowerCase().includes(columnFilters.correct_answer.toLowerCase())) {
      match = false;
    }
    if (columnFilters.difficulty && !q.difficulty?.toLowerCase().includes(columnFilters.difficulty.toLowerCase())) {
      match = false;
    }
    if (columnFilters.subject) {
      const subjName = q.subject_id && typeof q.subject_id === 'object' ? q.subject_id.name?.toLowerCase() : '';
      if (!subjName.includes(columnFilters.subject.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.subscription) {
      const subName = q.subscription_id && typeof q.subscription_id === 'object' ? q.subscription_id.name?.toLowerCase() : '';
      if (!subName.includes(columnFilters.subscription.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.addedBy && !q.addedBy?.toLowerCase().includes(columnFilters.addedBy.toLowerCase())) {
      match = false;
    }
    if (columnFilters.createdAt) {
      const cDate = new Date(q.createdAt).toLocaleDateString().toLowerCase();
      if (!cDate.includes(columnFilters.createdAt.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.updatedAt) {
      const uDate = new Date(q.updatedAt).toLocaleDateString().toLowerCase();
      if (!uDate.includes(columnFilters.updatedAt.toLowerCase())) {
        match = false;
      }
    }
    // For local admins, filter out questions with a subscription level higher than the organization’s level.
    if (!isSuperadmin) {
      const qSubName = q.subscription_id && typeof q.subscription_id === 'object' ? q.subscription_id.name : 'Free';
      if (getSubLevel(qSubName) > getSubLevel(organization.subscription?.name || 'Free')) {
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

      {/* Global / Local Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('global');
              setSelectedQuestions([]);
              setAllSelected(false);
            }}
          >
            Global
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('local');
              setSelectedQuestions([]);
              setAllSelected(false);
            }}
          >
            Local
          </button>
        </li>
      </ul>

      {/* Top Buttons (hide if local admin and activeTab is Global) */}
      <div className="d-flex justify-content-between mb-2">
        {!( !isSuperadmin && activeTab === 'global') && (
          <>
            <button
              className={`btn btn-danger ${selectedQuestions.length === 0 ? 'disabled' : ''}`}
              onClick={handleDeleteSelected}
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
          </>
        )}
      </div>

      {/* Pagination (top right) */}
      <div className="d-flex justify-content-end mb-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="mx-2 align-self-center">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Table */}
      <QuestionTable
        questions={displayedQuestions}
        selectedQuestions={selectedQuestions}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
        // Pass readOnly flag: if local admin is on global tab then disable editing.
        readOnly={!isSuperadmin && activeTab === 'global'}
      />

      {/* Pagination (bottom right) */}
      <div className="d-flex justify-content-end mt-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="mx-2 align-self-center">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h5>
                <button
                  type="button"
                  className="close"
                  style={{ background: 'none', border: 'none' }}
                  onClick={closeModal}
                >
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
                  // For superadmin, pass filteredSubjects; for local admins, pass only local subjects.
                  allSubjects={
                    isSuperadmin
                      ? filteredSubjects
                      : subjects.filter(
                          (subj) =>
                            subj.creatorRole === 'admin' &&
                            subj.ownerOrgId &&
                            subj.ownerOrgId.toString() === organization._id.toString()
                        )
                  }
                  allSubscriptions={subscriptions}
                  isSuperadmin={isSuperadmin}
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