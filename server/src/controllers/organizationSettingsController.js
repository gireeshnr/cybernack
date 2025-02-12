// server/src/controllers/organizationSettingsController.js
import OrganizationSettings from '../models/OrganizationSettings.js';
import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js';
import Industry from '../models/Industry.js';
import Domain from '../models/Domain.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

const subTier = { Free: 1, Standard: 2, Enterprise: 3 };

/**
 * Recursively filter the final doc so that only items matching `search`
 * (by name or question_text) plus their parent path remain.
 */
function filterDocBySearch(settingsDoc, search) {
  const lowerSearch = search.toLowerCase();

  // We'll build a new doc with filtered industries
  const newDoc = {
    _id: settingsDoc._id,
    orgId: settingsDoc.orgId,
    subscriptionTier: settingsDoc.subscriptionTier,
    industries: [],
    createdAt: settingsDoc.createdAt,
    updatedAt: settingsDoc.updatedAt,
    __v: settingsDoc.__v,
  };

  // check if a string matches
  function matchesName(nameOrText) {
    return nameOrText.toLowerCase().includes(lowerSearch);
  }

  settingsDoc.industries.forEach((ind) => {
    const industryName = ind.industryId?.name || '';
    let industryMatches = matchesName(industryName);

    // filter domains
    const filteredDomains = [];
    ind.domains.forEach((dom) => {
      const domainName = dom.domainId?.name || '';
      let domainMatches = matchesName(domainName);

      // filter subjects
      const filteredSubjects = [];
      dom.subjects.forEach((sub) => {
        const subjectName = sub.subjectId?.name || '';
        let subjectMatches = matchesName(subjectName);

        // filter questions
        const filteredQuestions = [];
        sub.questions.forEach((q) => {
          const qText = q.questionId?.question_text || '';
          if (matchesName(qText)) {
            filteredQuestions.push(q);
            subjectMatches = true; // subject must remain if any question matched
          }
        });

        if (subjectMatches || filteredQuestions.length > 0) {
          filteredSubjects.push({
            ...sub.toObject(),
            questions: filteredQuestions,
          });
          domainMatches = true;
        }
      });

      if (domainMatches || filteredSubjects.length > 0) {
        filteredDomains.push({
          ...dom.toObject(),
          subjects: filteredSubjects,
        });
        industryMatches = true;
      }
    });

    if (industryMatches || filteredDomains.length > 0) {
      newDoc.industries.push({
        ...ind.toObject(),
        domains: filteredDomains,
      });
    }
  });

  return newDoc;
}

/**
 * GET /organization-settings/hierarchy?search=optional
 * Builds or retrieves Industry->Domain->Subject->Question data for this org,
 * including all lower-tier subscriptions. Optionally filter by `search`.
 */
export async function getHierarchy(req, res) {
  try {
    const { search } = req.query;

    // 1) find the organization
    const org = await Organization.findById(req.user.org).populate('subscription');
    if (!org) {
      return res.status(404).json({ error: 'Organization not found.' });
    }
    const orgSubName = org.subscription?.name || 'Free';
    const orgTier = subTier[orgSubName] || 1;

    // gather all subscription docs
    const allSubs = await Subscription.find({ isActive: true });
    const allowedSubIds = [];
    for (const s of allSubs) {
      const sTier = subTier[s.name] || 1;
      if (sTier <= orgTier) {
        allowedSubIds.push(s._id);
      }
    }

    // 2) check if we already have OrganizationSettings
    let settings = await OrganizationSettings.findOne({ orgId: org._id })
      .populate('industries.industryId')
      .populate('industries.domains.domainId')
      .populate('industries.domains.subjects.subjectId')
      .populate('industries.domains.subjects.questions.questionId');

    if (settings) {
      // see if tier changed
      const oldTier = settings.subscriptionTier || 1;
      if (oldTier !== orgTier) {
        // rebuild
        await OrganizationSettings.deleteOne({ _id: settings._id });
        settings = null;
      }
    }

    // 3) if no settings doc, build from scratch
    if (!settings) {
      // build industries
      const industries = await Industry.find({
        subscription_id: { $in: allowedSubIds },
      });
      const industriesArray = [];
      for (const ind of industries) {
        const domains = await Domain.find({
          industries: ind._id,
          subscription_id: { $in: allowedSubIds },
        });
        const domainEntries = [];
        for (const dom of domains) {
          const subjects = await Subject.find({
            domain_id: dom._id,
            subscription_id: { $in: allowedSubIds },
          });
          const subjectEntries = [];
          for (const sub of subjects) {
            const questions = await Question.find({
              subject_id: sub._id,
              subscription_id: { $in: allowedSubIds },
            });
            const questionEntries = questions.map((q) => ({
              questionId: q._id,
              active: true,
            }));
            subjectEntries.push({
              subjectId: sub._id,
              active: true,
              questions: questionEntries,
            });
          }
          domainEntries.push({
            domainId: dom._id,
            active: true,
            subjects: subjectEntries,
          });
        }
        industriesArray.push({
          industryId: ind._id,
          active: true,
          domains: domainEntries,
        });
      }
      const newSettings = new OrganizationSettings({
        orgId: org._id,
        subscriptionTier: orgTier,
        industries: industriesArray,
      });
      await newSettings.save();

      settings = await OrganizationSettings.findById(newSettings._id)
        .populate('industries.industryId')
        .populate('industries.domains.domainId')
        .populate('industries.domains.subjects.subjectId')
        .populate('industries.domains.subjects.questions.questionId');
    }

    // 4) if we have an existing doc (or just built one), optionally filter
    if (settings && search) {
      const filtered = filterDocBySearch(settings, search);
      return res.json(filtered);
    }

    return res.json(settings);
  } catch (err) {
    console.error('Error in getHierarchy:', err);
    return res.status(500).json({ error: 'Failed to retrieve hierarchy.' });
  }
}

/**
 * POST /organization-settings/toggle
 * (same as your existing code, partial toggles either only here or across references)
 */
export async function toggleItem(req, res) {
  // same code as before
  // not repeating for brevity
  // ...
}

/**
 * POST /organization-settings/hierarchy
 * (the old full update if you still want it)
 */
export async function updateHierarchy(req, res) {
  // same code as before
  // ...
}

export default {
  getHierarchy,
  toggleItem,
  updateHierarchy,
};