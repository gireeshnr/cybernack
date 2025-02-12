import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const QuestionTable = ({
  questions,
  selectedQuestions,
  onRowClick,
  onEditClick,
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No questions available.
              </td>
            </tr>
          ) : (
            questions.map((q) => {
              const subjectLabel = q.subject_id && typeof q.subject_id === 'object'
                ? q.subject_id.name
                : q.subject_id || '—';

              const subscriptionLabel = q.subscription_id && typeof q.subscription_id === 'object'
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
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditClick(q)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
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
        PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
        }),
      ]),
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
        }),
      ]),
      difficulty: PropTypes.string,
    })
  ).isRequired,
  selectedQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};

export default QuestionTable;
