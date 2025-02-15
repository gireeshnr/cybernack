// server/src/controllers/bulkUploadController.js
import fs from 'fs';
import csvParser from 'csv-parser';
import Industry from '../models/Industry.js';
import Domain from '../models/Domain.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import Subscription from '../models/Subscription.js';
import OrganizationSettings from '../models/OrganizationSettings.js';
import Organization from '../models/Organization.js';

export default {
  downloadTemplate: async (req, res) => {
    try {
      const userRole = req.user.role;
      let columns = [
        'industry_name',
        'domain_name',
        'subject_name',
        'question_text',
        'answer_options',
        'correct_answer',
        'difficulty',
        'explanation',
      ];
      let sampleRow = [
        'Finance',
        'PCI DSS',
        'Data Storage',
        'Which of the following is a requirement for storing cardholder data under PCI DSS?',
        '["Encryption of data at rest","Storing data in plain text"]',
        'A',
        'Medium',
        'PCI DSS requires that cardholder data be encrypted when stored.',
      ];
      if (req.user.role === 'superadmin') {
        columns.push('subscription');
        sampleRow.push('Enterprise');
      }
      const headerLine = columns.join(',');
      const sampleLine = sampleRow
        .map((val) => (/,|"/.test(val) ? `"${val.replace(/"/g, '""')}"` : val))
        .join(',');
      const csvContent = [headerLine, sampleLine].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bulk_upload_template.csv"');
      res.send(csvContent);
    } catch (err) {
      console.error('Error downloading template:', err);
      res.status(500).json({ error: 'Failed to download template' });
    }
  },

  handleBulkUpload: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const role = req.user.role;
      const orgId = req.user.org;
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
            await processBulkRows(rows, role, orgId);
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

async function processBulkRows(rows, role, orgId) {
  let clientName = '';
  if (role === 'admin') {
    const orgDoc = await Organization.findById(orgId);
    clientName = orgDoc?.name || '';
  }
  for (const row of rows) {
    const {
      industry_name,
      domain_name,
      subject_name,
      question_text,
      answer_options,
      correct_answer,
      difficulty,
      explanation,
      subscription,
    } = row;

    let subscriptionDoc = null;
    if (subscription) {
      subscriptionDoc = await Subscription.findOne({ name: subscription });
    }

    // Set ownerOrgId: for client admin, use orgId; for superadmin, leave null.
    let ownerOrgId = role === 'admin' ? orgId : null;

    // 1) Industry
    let industryDoc = await Industry.findOne({ name: industry_name });
    if (!industryDoc) {
      industryDoc = new Industry({
        name: industry_name,
        description: 'Bulk import',
      });
    }
    if (subscriptionDoc) {
      industryDoc.subscription_id = subscriptionDoc._id;
    }
    industryDoc.ownerOrgId = ownerOrgId;
    // Set addedBy: for admin, use clientName; for superadmin, use "Cybernack"
    industryDoc.addedBy = role === 'admin' ? clientName : 'Cybernack';
    await industryDoc.save();

    // 2) Domain
    let domainDoc = await Domain.findOne({ name: domain_name });
    if (!domainDoc) {
      domainDoc = new Domain({
        name: domain_name,
        description: 'Bulk domain import',
        industries: [industryDoc._id],
      });
    } else if (!domainDoc.industries.includes(industryDoc._id)) {
      domainDoc.industries.push(industryDoc._id);
    }
    if (subscriptionDoc) {
      domainDoc.subscription_id = subscriptionDoc._id;
    }
    domainDoc.ownerOrgId = ownerOrgId;
    domainDoc.addedBy = role === 'admin' ? clientName : 'Cybernack';
    await domainDoc.save();

    // 3) Subject
    let subjectDoc = await Subject.findOne({ name: subject_name });
    if (!subjectDoc) {
      subjectDoc = new Subject({
        name: subject_name,
        description: 'Bulk subject import',
        domain_id: domainDoc._id,
      });
    } else if (!subjectDoc.domain_id) {
      subjectDoc.domain_id = domainDoc._id;
    }
    if (subscriptionDoc) {
      subjectDoc.subscription_id = subscriptionDoc._id;
    }
    subjectDoc.ownerOrgId = ownerOrgId;
    subjectDoc.addedBy = role === 'admin' ? clientName : 'Cybernack';
    await subjectDoc.save();

    // 4) Question
    if (question_text && question_text.trim() !== '') {
      let questionDoc = await Question.findOne({ question_text });
      if (!questionDoc) {
        questionDoc = new Question({
          question_text,
          question: question_text,
          answer_options: parseAnswerOptions(answer_options),
          correct_answer: correct_answer || '',
          difficulty: difficulty || 'Medium',
          explanation: explanation || '',
          subject_id: subjectDoc._id,
        });
      } else {
        questionDoc.question = question_text;
      }
      if (subscriptionDoc) {
        questionDoc.subscription_id = subscriptionDoc._id;
      }
      questionDoc.ownerOrgId = ownerOrgId;
      questionDoc.addedBy = role === 'admin' ? clientName : 'Cybernack';
      await questionDoc.save();
    }

    // If role is admin, update OrganizationSettings accordingly
    if (role === 'admin') {
      await addToOrgSettings(orgId, industryDoc, domainDoc, subjectDoc);
    }
  }
}

function parseAnswerOptions(str) {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return str.split(',').map((s) => s.trim());
  }
}

async function addToOrgSettings(orgId, industryDoc, domainDoc, subjectDoc) {
  let settings = await OrganizationSettings.findOne({ orgId });
  if (!settings) {
    settings = new OrganizationSettings({ orgId, industries: [] });
  }
  let ind = settings.industries.find(
    (i) => String(i.industryId) === String(industryDoc._id)
  );
  if (!ind) {
    ind = { industryId: industryDoc._id, active: true, domains: [] };
    settings.industries.push(ind);
  }
  let dom = ind.domains.find(
    (d) => String(d.domainId) === String(domainDoc._id)
  );
  if (!dom) {
    dom = { domainId: domainDoc._id, active: true, subjects: [] };
    ind.domains.push(dom);
  }
  let sub = dom.subjects.find(
    (s) => String(s.subjectId) === String(subjectDoc._id)
  );
  if (!sub) {
    sub = { subjectId: subjectDoc._id, active: true, questions: [] };
    dom.subjects.push(sub);
  }
  await settings.save();
}