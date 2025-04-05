// client/src/components/AppSettings/Questions/QuestionForm.js
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
  isSuperadmin,
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
        {/* Subscription (only for superadmin) */}
        {isSuperadmin && (
          <div className="form-group mb-2">
            <label>Subscription</label>
            <select
              name="subscription_id"
              className="form-control"
              value={data.subscription_id || ''}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Subscription --</option>
              {allSubscriptions.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <small className="form-text text-muted">
              Choose the subscription level for this question.
            </small>
          </div>
        )}

        {/* Subject */}
        <div className="form-group mb-2">
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

        {/* Short text (snippet) */}
        <div className="form-group mb-2">
          <label>Short Question Snippet</label>
          <input
            type="text"
            name="short_text"
            className="form-control"
            value={data.short_text || ''}
            onChange={handleChange}
            required
          />
          <small className="form-text text-muted">
            A brief snippet (up to ~100 chars).
          </small>
        </div>

        {/* Full text (optional) */}
        <div className="form-group mb-2">
          <label>Full Question Text (optional)</label>
          <textarea
            name="full_text"
            className="form-control"
            value={data.full_text || ''}
            onChange={handleChange}
            rows="3"
          />
        </div>

        {/* EXACT 4 answer options */}
        <label className="form-label mt-3">Answer Options</label>
        <div className="form-group d-flex flex-column gap-1 mb-2">
          <input
            type="text"
            name="optionA"
            className="form-control"
            placeholder="Option A"
            value={data.optionA || ''}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="optionB"
            className="form-control"
            placeholder="Option B"
            value={data.optionB || ''}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="optionC"
            className="form-control"
            placeholder="Option C"
            value={data.optionC || ''}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="optionD"
            className="form-control"
            placeholder="Option D"
            value={data.optionD || ''}
            onChange={handleChange}
            required
          />
        </div>

        {/* Correct Answer */}
        <div className="form-group mb-2">
          <label>Correct Answer</label>
          <select
            name="correct_answer"
            className="form-control"
            value={data.correct_answer || ''}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          <small className="form-text text-muted">
            Must match exactly one of A/B/C/D.
          </small>
        </div>

        {/* Difficulty */}
        <div className="form-group mb-2">
          <label>Difficulty</label>
          <select
            name="difficulty"
            className="form-control"
            value={data.difficulty || 'Medium'}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Explanation */}
        <div className="form-group mb-2">
          <label>Explanation (optional)</label>
          <textarea
            name="explanation"
            className="form-control"
            value={data.explanation || ''}
            onChange={handleChange}
            rows="2"
          />
        </div>

        {/* Buttons */}
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
    short_text: PropTypes.string,
    full_text: PropTypes.string,
    optionA: PropTypes.string,
    optionB: PropTypes.string,
    optionC: PropTypes.string,
    optionD: PropTypes.string,
    correct_answer: PropTypes.string,
    difficulty: PropTypes.string,
    explanation: PropTypes.string,
    subscription_id: PropTypes.string,
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  allSubjects: PropTypes.array.isRequired,
  allSubscriptions: PropTypes.array.isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
};

export default QuestionForm;