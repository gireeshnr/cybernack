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
            <th>Select</th>
            <th>Question Text</th>
            <th>Subject</th>
            <th>Subscription</th>
            <th>Difficulty</th>
            <th>Added By</th>
            <th>Actions</th>
          </tr>
          {/* Filter row with select all checkbox */}
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                style={{ marginRight: '4px' }}
              />
              <label style={{ fontSize: '0.8rem', margin: 0 }}>Select All</label>
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Text"
                value={columnFilters.question_text}
                onChange={(e) => onColumnFilterChange('question_text', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Subject"
                value={columnFilters.subject}
                onChange={(e) => onColumnFilterChange('subject', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Subscription"
                value={columnFilters.subscription}
                onChange={(e) => onColumnFilterChange('subscription', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Difficulty"
                value={columnFilters.difficulty}
                onChange={(e) => onColumnFilterChange('difficulty', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Added By"
                value={columnFilters.addedBy}
                onChange={(e) => onColumnFilterChange('addedBy', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
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
                  <td>{q.question_text}</td>
                  <td>{subjectLabel}</td>
                  <td>{subscriptionLabel}</td>
                  <td>{q.difficulty || '—'}</td>
                  <td>{q.addedBy || '—'}</td>
                  <td>
                    <button
                      onClick={() => onEditClick(q)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
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
      question_text: PropTypes.string,
      subject_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      difficulty: PropTypes.string,
      addedBy: PropTypes.string,
    })
  ).isRequired,
  selectedQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  columnFilters: PropTypes.shape({
    question_text: PropTypes.string,
    subject: PropTypes.string,
    subscription: PropTypes.string,
    difficulty: PropTypes.string,
    addedBy: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
};

export default QuestionTable;