import Question from '../models/Question.js';
import logger from '../util/logger.js'; // If you're using your logger

// Create a question
export const createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    const savedQuestion = await question.save();

    // We'll populate subject_id & subscription_id on the saved doc
    await savedQuestion.populate('subject_id');
    await savedQuestion.populate('subscription_id');

    return res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Error creating question:', error.stack || error);
    logger.error(`Error creating question: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error creating question',
      error: error.message,
    });
  }
};

// Get all questions
export const getQuestions = async (req, res) => {
  try {
    // Populate both subject_id & subscription_id
    const questions = await Question.find()
      .populate('subject_id')
      .populate('subscription_id');

    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error.stack || error);
    logger.error(`Error fetching questions: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error fetching questions',
      error: error.message,
    });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    // If req.body includes subscription_id, it updates as well
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('subject_id')
      .populate('subscription_id');

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    return res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error.stack || error);
    logger.error(`Error updating question: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error updating question',
      error: error.message,
    });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error.stack || error);
    logger.error(`Error deleting question: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error deleting question',
      error: error.message,
    });
  }
};
