// client/src/components/AppSettings/Questions/QuestionTable.js
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const QuestionTable = ({
  questions,
  selectedQuestions,
  onRowClick,
  onEditClick,
  columnFilters,
  onColumnFilterChange,
  onToggleSelectAll,
  allSelected,
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            {/* Keep columns in the order you requested */}
            <th>Select</th>
            <th>Q#</th>
            <th>Question</th>
            <th>Question Description</th>
            <th>Explanation</th>
            <th>Answer Options</th>
            <th>Correct Answer</th>
            <th>Difficulty</th>
            <th>Subject</th>
            <th>Subscription</th>
            <th>Added By</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
          {/* Filter Row */}
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                style={{ marginRight: '4px' }}
              />
              <label style={{ fontSize: '0.8rem' }}>All</label>
            </th>
            {/* Q# filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Q#"
                value={columnFilters.question_number}
                onChange={(e) => onColumnFilterChange('question_number', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Question filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Question"
                value={columnFilters.short_text}
                onChange={(e) => onColumnFilterChange('short_text', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Question Description filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Description"
                value={columnFilters.full_text}
                onChange={(e) => onColumnFilterChange('full_text', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Explanation filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Explanation"
                value={columnFilters.explanation}
                onChange={(e) => onColumnFilterChange('explanation', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Answer Options filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Options"
                value={columnFilters.answer_options}
                onChange={(e) => onColumnFilterChange('answer_options', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Correct Answer filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Correct"
                value={columnFilters.correct_answer}
                onChange={(e) => onColumnFilterChange('correct_answer', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Difficulty filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Diff"
                value={columnFilters.difficulty}
                onChange={(e) => onColumnFilterChange('difficulty', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Subject filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Subject"
                value={columnFilters.subject}
                onChange={(e) => onColumnFilterChange('subject', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Subscription filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Subscr"
                value={columnFilters.subscription}
                onChange={(e) => onColumnFilterChange('subscription', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Added By filter */}
            <th>
              <input
                type="text"
                placeholder="Filter AddedBy"
                value={columnFilters.addedBy}
                onChange={(e) => onColumnFilterChange('addedBy', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Created At filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Created"
                value={columnFilters.createdAt}
                onChange={(e) => onColumnFilterChange('createdAt', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Updated At filter */}
            <th>
              <input
                type="text"
                placeholder="Filter Updated"
                value={columnFilters.updatedAt}
                onChange={(e) => onColumnFilterChange('updatedAt', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {/* Actions: no filter */}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan={14} className="text-center">
                No questions available.
              </td>
            </tr>
          ) : (
            questions.map((q) => {
              const subjectLabel =
                q.subject_id && typeof q.subject_id === 'object'
                  ? q.subject_id.name
                  : q.subject_id || '—';

              const subscriptionLabel =
                q.subscription_id && typeof q.subscription_id === 'object'
                  ? q.subscription_id.name
                  : q.subscription_id || '—';

              // Combine answer options for display
              const optsDisplay = Array.isArray(q.answer_options)
                ? q.answer_options.join(', ')
                : '—';

              return (
                <tr
                  key={q._id}
                  className={selectedQuestions.includes(q._id) ? 'table-primary' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q._id)}
                      onChange={() => onRowClick(q._id)}
                    />
                  </td>
                  <td>{q.question_number || '—'}</td>
                  <td>{q.short_text || '—'}</td>
                  <td>{q.full_text || '—'}</td>
                  <td>{q.explanation || '—'}</td>
                  <td>{optsDisplay}</td>
                  <td>{q.correct_answer || '—'}</td>
                  <td>{q.difficulty || '—'}</td>
                  <td>{subjectLabel}</td>
                  <td>{subscriptionLabel}</td>
                  <td>{q.addedBy || '—'}</td>
                  <td>
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    {q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    <button
                      onClick={() => onEditClick(q)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.8rem' }} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

QuestionTable.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      question_number: PropTypes.string,
      short_text: PropTypes.string,
      full_text: PropTypes.string,
      explanation: PropTypes.string,
      answer_options: PropTypes.arrayOf(PropTypes.string),
      correct_answer: PropTypes.string,
      difficulty: PropTypes.string,
      subject_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      addedBy: PropTypes.string,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  ).isRequired,
  selectedQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  columnFilters: PropTypes.shape({
    question_number: PropTypes.string,
    short_text: PropTypes.string,
    full_text: PropTypes.string,
    explanation: PropTypes.string,
    answer_options: PropTypes.string,
    correct_answer: PropTypes.string,
    difficulty: PropTypes.string,
    subject: PropTypes.string,
    subscription: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
};

export default QuestionTable;