// server/src/controllers/questionController.js
import Question from '../models/Question.js';
import Subject from '../models/Subject.js';
import logger from '../util/logger.js';

export const createQuestion = async (req, res) => {
  try {
    let {
      question_number,
      short_text,
      full_text,
      answer_options,
      correct_answer,
      subject_id,
      subscription_id,
      ownerOrgId,
      difficulty,
      explanation,
      addedBy,
    } = req.body;

    // Get user details from request
    const { role, organization } = req.user;

    // 1. Find the subject and populate domain_id (if needed for auto-generating question_number)
    const subjectDoc = await Subject.findById(subject_id).populate('domain_id');
    if (!subjectDoc) {
      return res.status(400).json({ message: 'Invalid subject_id provided.' });
    }

    // 2. If missing question_number, auto-generate from domain + subject
    if (!question_number) {
      const domainName = subjectDoc.domain_id?.name || 'GEN';
      const subjectName = subjectDoc.name || 'SUBJ';
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      question_number = `${domainName.slice(0, 3).toUpperCase()}-${subjectName.slice(0, 3).toUpperCase()}-${randomSuffix}`;
    }

    // 3. Set short_text if missing
    if (!short_text) {
      short_text = full_text ? full_text.substring(0, 100) : 'Untitled Question';
    }

    // 4. Ensure answer_options is exactly 4
    if (!Array.isArray(answer_options) || answer_options.length !== 4) {
      return res.status(400).json({
        message: 'answer_options must be an array of exactly 4 items (A, B, C, D).',
      });
    }

    // 5. For local admins, override subscription_id and ownerOrgId
    if (role !== 'superadmin') {
      subscription_id = organization.subscription._id;
      ownerOrgId = organization._id;
    } else {
      // For superadmins, ensure subscription_id is provided
      if (!subscription_id) {
        return res.status(400).json({ message: 'Subscription is required for global questions.' });
      }
      // (Optionally, add validation to check if the subject belongs to that subscription.)
    }

    // 6. Create the Question document
    const newQuestion = new Question({
      question_number,
      short_text,
      full_text: full_text || '',
      answer_options,
      correct_answer,
      subject_id,
      subscription_id,
      ownerOrgId: ownerOrgId || null,
      difficulty: difficulty || 'Medium',
      explanation: explanation || '',
      addedBy: addedBy || '',
    });

    const savedQuestion = await newQuestion.save();
    await savedQuestion.populate('subject_id');
    await savedQuestion.populate('subscription_id');

    return res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    logger.error(`Error creating question: ${error.message}\nStack: ${error.stack}`);
    return res.status(500).json({
      message: 'Error creating question',
      error: error.message,
    });
  }
};

export const getQuestions = async (req, res) => {
  try {
    let questions = await Question.find()
      .populate('subject_id')
      .populate('subscription_id')
      .lean();

    // For local admins, filter out questions with subscription levels above org’s level
    const { role, organization } = req.user;
    if (role !== 'superadmin') {
      const orgSubLevel = (function(name) {
        if (!name) return 1;
        const lower = name.trim().toLowerCase();
        if (lower === 'free') return 1;
        if (lower === 'standard') return 2;
        if (lower === 'enterprise') return 3;
        return 0;
      })(organization.subscription?.name || 'Free');

      questions = questions.filter((q) => {
        const qSubName =
          q.subscription_id && typeof q.subscription_id === 'object'
            ? q.subscription_id.name
            : 'Free';
        const qSubLevel = (function(name) {
          const lower = name.trim().toLowerCase();
          if (lower === 'free') return 1;
          if (lower === 'standard') return 2;
          if (lower === 'enterprise') return 3;
          return 0;
        })(qSubName);
        return qSubLevel <= orgSubLevel;
      });
    }

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

export const updateQuestion = async (req, res) => {
  try {
    const {
      question_number,
      short_text,
      full_text,
      answer_options,
      correct_answer,
      subject_id,
      subscription_id,
      ownerOrgId,
      difficulty,
      explanation,
      addedBy,
    } = req.body;

    // If answer_options is provided, ensure it has exactly 4 items
    if (answer_options && (!Array.isArray(answer_options) || answer_options.length !== 4)) {
      return res.status(400).json({
        message: 'answer_options must be an array of exactly 4 items.',
      });
    }

    // Build update data object
    const updateData = {};
    if (question_number) updateData.question_number = question_number;
    if (short_text) updateData.short_text = short_text;
    if (typeof full_text !== 'undefined') updateData.full_text = full_text;
    if (answer_options) updateData.answer_options = answer_options;
    if (correct_answer) updateData.correct_answer = correct_answer;
    if (subject_id) updateData.subject_id = subject_id;
    if (subscription_id !== undefined) updateData.subscription_id = subscription_id;
    if (ownerOrgId !== undefined) updateData.ownerOrgId = ownerOrgId;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (addedBy !== undefined) updateData.addedBy = addedBy;

    // Get user details and override subscription for local admins
    const { role: userRole, organization } = req.user;
    if (userRole !== 'superadmin') {
      updateData.subscription_id = organization.subscription._id;
      updateData.ownerOrgId = organization._id;
    } else {
      if (!subscription_id) {
        return res.status(400).json({ message: 'Subscription is required for global questions.' });
      }
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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