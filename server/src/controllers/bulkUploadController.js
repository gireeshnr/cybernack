// server/src/controllers/bulkUploadController.js
import fs from 'fs';
import csvParser from 'csv-parser';
import Industry from '../models/Industry.js';
import Domain from '../models/Domain.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import Subscription from '../models/Subscription.js';
import Organization from '../models/Organization.js';

/**
 * Download CSV template for bulk uploading content data.
 */
export default {
  downloadTemplate: async (req, res) => {
    try {
      // Define the required columns for the bulk upload template.
      // Note: For local admin users, the "industry" columns are still included in the template
      // for reference purposes, but they will be overridden on the server.
      let columns = [
        'industry_name',
        'industry_description',
        'domain_name',
        'domain_description',
        'subject_name',
        'subject_description',
        'Short Question',
        'Full Question',
        'optionA',
        'optionB',
        'optionC',
        'optionD',
        'correct_answer',
        'difficulty',
        'explanation'
      ];
      let sampleRow = [
        'Finance',
        'Financial services and operations',
        'PCI DSS',
        'Standards for payment card data security',
        'Data Storage',
        'Storage and protection of cardholder data',
        'Encryption at Rest required?',
        'Under PCI DSS, cardholder data must be encrypted at rest.',
        'Encrypt data on disk',
        'Store in plain text',
        'Mask data only',
        'No controls needed',
        'A',
        'Medium',
        'PCI requires encryption at rest for CHD'
      ];

      // If the user is superadmin, include the subscription column.
      if (req.user.role === 'superadmin') {
        columns.push('subscription');
        sampleRow.push('Enterprise');
      }

      const headerLine = columns.join(',');
      const sampleLine = sampleRow
        .map((val) =>
          /,|"/.test(val) ? `"${val.replace(/"/g, '""')}"` : val
        )
        .join(',');
      const csvContent = [headerLine, sampleLine].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="bulk_upload_template.csv"'
      );
      res.send(csvContent);
    } catch (err) {
      console.error('Error downloading template:', err);
      res.status(500).json({ error: 'Failed to download template' });
    }
  },

  handleBulkUpload: async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });

      const role = req.user.role;
      const orgId = req.user.org;
      const uploaderEmail = req.user.email; // Capture uploader's email
      const filePath = req.file.path;
      const rows = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
          console.log('DEBUG CSV ROW:', data);
          rows.push(data);
        })
        .on('end', async () => {
          try {
            await processBulkRows(rows, role, orgId, uploaderEmail);
            fs.unlinkSync(filePath);
            res.json({ message: 'CSV processed successfully!' });
          } catch (errProc) {
            console.error('Error processing CSV rows:', errProc);
            res.status(500).json({ error: 'Error processing CSV rows.' });
          }
        });
    } catch (err) {
      console.error('Error in handleBulkUpload:', err);
      res.status(500).json({ error: 'Failed to handle bulk upload' });
    }
  },
};

/**
 * Process each CSV row:
 * - For local admins, the industry_name and industry_description columns are overridden
 *   using the organization's name and a default description.
 * - Upsert (create or update) Industry, Domain, Subject, and Question records.
 * - All queries are scoped with ownerOrgId so that records are kept separate.
 * - The "addedBy" field is set to the uploader's email.
 */
async function processBulkRows(rows, role, orgId, uploaderEmail) {
  let ownerOrgId = null;
  let orgDoc = null;

  if (role === 'admin') {
    orgDoc = await Organization.findById(orgId);
    ownerOrgId = orgId;
  } else if (role === 'superadmin') {
    // For superadmin, work with the global organization "Cybernack"
    orgDoc = await Organization.findOne({ name: 'Cybernack' });
    if (!orgDoc) {
      orgDoc = new Organization({ name: 'Cybernack', isActive: true });
      await orgDoc.save();
    }
    ownerOrgId = orgDoc._id;
  }

  // Process each CSV row
  for (const row of rows) {
    // For local admin, override industry fields using the organization’s name.
    let industryName = row.industry_name ? row.industry_name.trim() : "";
    let industryDescription = row.industry_description ? row.industry_description.trim() : "";
    if (role === 'admin' && orgDoc) {
      industryName = orgDoc.name;
      industryDescription = "Default industry for local records";
    }
    const domainName = row.domain_name ? row.domain_name.trim() : "";
    const domainDescription = row.domain_description ? row.domain_description.trim() : "";
    const subjectName = row.subject_name ? row.subject_name.trim() : "";
    const subjectDescription = row.subject_description ? row.subject_description.trim() : "";
    const shortText = row['Short Question'] ? row['Short Question'].trim() : "";
    const fullText = row['Full Question'] ? row['Full Question'].trim() : "";
    const optionA = row.optionA ? row.optionA.trim() : "";
    const optionB = row.optionB ? row.optionB.trim() : "";
    const optionC = row.optionC ? row.optionC.trim() : "";
    const optionD = row.optionD ? row.optionD.trim() : "";
    const correctAnswer = row.correct_answer ? row.correct_answer.trim() : "";
    const difficulty = row.difficulty ? row.difficulty.trim() : "Medium";
    const explanation = row.explanation ? row.explanation.trim() : "";
    const subscriptionName = row.subscription ? row.subscription.trim() : "";

    if (!industryName || !domainName || !subjectName) {
      console.log(
        `Skipping row. Missing required fields: industry='${industryName}', domain='${domainName}', subject='${subjectName}'`
      );
      continue;
    }

    // Handle subscription: if provided, look it up; otherwise, default to org's subscription.
    let subscriptionDoc = null;
    if (subscriptionName !== "") {
      subscriptionDoc = await Subscription.findOne({ name: subscriptionName });
    } else if (orgDoc && orgDoc.subscription) {
      subscriptionDoc = await Subscription.findById(orgDoc.subscription);
    }

    // Use the uploader's email for "addedBy"
    const addedBy = uploaderEmail;

    // Upsert Industry
    let industryDoc = await Industry.findOne({ name: industryName, ownerOrgId });
    if (!industryDoc) {
      industryDoc = new Industry({
        name: industryName,
        description: industryDescription || 'Bulk import',
        ownerOrgId,
        addedBy,
        creatorRole: role, // Set creatorRole based on user role.
      });
    } else if (industryDescription) {
      industryDoc.description = industryDescription;
    }
    if (subscriptionDoc) {
      industryDoc.subscription_id = subscriptionDoc._id;
    }
    await industryDoc.save();

    // Upsert Domain
    let domainDoc = await Domain.findOne({ name: domainName, ownerOrgId });
    if (!domainDoc) {
      domainDoc = new Domain({
        name: domainName,
        description: domainDescription || 'Bulk domain import',
        industry_id: industryDoc._id,
        ownerOrgId,
        addedBy,
        creatorRole: role,
      });
    } else {
      domainDoc.industry_id = industryDoc._id;
      if (domainDescription) {
        domainDoc.description = domainDescription;
      }
      if (!domainDoc.addedBy) {
        domainDoc.addedBy = addedBy;
      }
    }
    if (subscriptionDoc) {
      domainDoc.subscription_id = subscriptionDoc._id;
    }
    await domainDoc.save();

    // Upsert Subject
    let subjectDoc = await Subject.findOne({ name: subjectName, ownerOrgId });
    if (!subjectDoc) {
      subjectDoc = new Subject({
        name: subjectName,
        description: subjectDescription || 'Bulk subject import',
        domain_id: domainDoc._id,
        ownerOrgId,
        addedBy,
        creatorRole: role,
      });
    } else {
      if (subjectDescription) {
        subjectDoc.description = subjectDescription;
      }
      if (!subjectDoc.domain_id) {
        subjectDoc.domain_id = domainDoc._id;
      }
    }
    if (subscriptionDoc) {
      subjectDoc.subscription_id = subscriptionDoc._id;
    }
    await subjectDoc.save();

    // Create or update Question if complete question data is provided
    const answerOptions = [optionA, optionB, optionC, optionD];
    const anyBlankOption = answerOptions.some((opt) => !opt);
    if (shortText && shortText !== "" && !anyBlankOption && correctAnswer) {
      const questionNumber = await generateQuestionNumber(subjectDoc);
      let questionDoc = await Question.findOne({ short_text: shortText, ownerOrgId });
      if (!questionDoc) {
        questionDoc = new Question({
          question_number: questionNumber,
          short_text: shortText,
          full_text: fullText,
          answer_options: answerOptions,
          correct_answer: correctAnswer,
          difficulty,
          explanation,
          subject_id: subjectDoc._id,
          subscription_id: subscriptionDoc ? subscriptionDoc._id : null,
          ownerOrgId,
          addedBy,
        });
      } else {
        questionDoc.question_number = questionDoc.question_number || questionNumber;
        questionDoc.full_text = fullText;
        questionDoc.answer_options = answerOptions;
        questionDoc.correct_answer = correctAnswer || questionDoc.correct_answer;
        questionDoc.difficulty = difficulty || questionDoc.difficulty;
        questionDoc.explanation = explanation || questionDoc.explanation;
        questionDoc.subject_id = subjectDoc._id;
        if (subscriptionDoc) {
          questionDoc.subscription_id = subscriptionDoc._id;
        }
        questionDoc.addedBy = addedBy;
      }
      await questionDoc.save();
    } else {
      console.log(`Skipping question. Incomplete data for short_text='${shortText}'`);
    }
  }
}

/**
 * Generate a unique question number using a prefix from domain and subject names.
 */
async function generateQuestionNumber(subjectDoc) {
  await subjectDoc.populate('domain_id');
  const domainName = subjectDoc.domain_id?.name || 'GEN';
  const subjectName = subjectDoc.name || 'SUBJ';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${domainName.slice(0, 3).toUpperCase()}-${subjectName.slice(0, 3).toUpperCase()}-${randomSuffix}`;
}

export { processBulkRows };