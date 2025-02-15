import React from 'react';
import PropTypes from 'prop-types';

const QuestionForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allSubjects,
  allSubscriptions,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="card p-3 mb-4"
      style={{
        maxHeight: '600px',
        overflowY: 'auto',
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* Subject */}
        <div className="form-group">
          <label>Subject</label>
          <select
            name="subject_id"
            className="form-control"
            value={data.subject_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Subject --</option>
            {allSubjects.map((subj) => (
              <option key={subj._id} value={subj._id}>
                {subj.name}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            Choose the subject this question belongs to.
          </small>
        </div>

        {/* Question short label */}
        <div className="form-group">
          <label>Question</label>
          <input
            type="text"
            name="question"
            className="form-control"
            value={data.question || ''}
            onChange={handleChange}
            required
          />
          <small className="form-text text-muted">
            Short question identifier/title.
          </small>
        </div>

        {/* Question Text */}
        <div className="form-group">
          <label>Question Text</label>
          <textarea
            name="question_text"
            className="form-control"
            value={data.question_text || ''}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>

        {/* Answer Options */}
        <div className="form-group">
          <label>Answer Options (comma separated)</label>
          <input
            type="text"
            name="answer_options"
            className="form-control"
            placeholder="e.g. option1, option2, option3"
            value={data.answer_options || ''}
            onChange={handleChange}
            required
          />
          <small className="form-text text-muted">
            We'll split by commas to form multiple choice answers.
          </small>
        </div>

        {/* Correct Answer */}
        <div className="form-group">
          <label>Correct Answer</label>
          <input
            type="text"
            name="correct_answer"
            className="form-control"
            value={data.correct_answer || ''}
            onChange={handleChange}
            required
          />
          <small className="form-text text-muted">
            This should match exactly one of the answer options.
          </small>
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label>Difficulty</label>
          <select
            name="difficulty"
            className="form-control"
            value={data.difficulty || ''}
            onChange={handleChange}
          >
            <option value="">-- Select Difficulty --</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Explanation */}
        <div className="form-group">
          <label>Explanation</label>
          <textarea
            name="explanation"
            className="form-control"
            value={data.explanation || ''}
            onChange={handleChange}
            rows="2"
          />
        </div>

        {/* Subscription Dropdown */}
        <div className="form-group">
          <label>Subscription</label>
          <select
            name="subscription_id"
            className="form-control"
            value={data.subscription_id || ''}
            onChange={handleChange}
          >
            <option value="">-- Select Subscription --</option>
            {allSubscriptions.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            (Optional) Choose a subscription plan for this question.
          </small>
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

QuestionForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    subject_id: PropTypes.string,
    question: PropTypes.string,
    question_text: PropTypes.string,
    answer_options: PropTypes.string,
    correct_answer: PropTypes.string,
    difficulty: PropTypes.string,
    explanation: PropTypes.string,
    subscription_id: PropTypes.string,
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  allSubjects: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  allSubscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default QuestionForm;