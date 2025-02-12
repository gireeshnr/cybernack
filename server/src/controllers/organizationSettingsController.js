// server/src/controllers/organizationSettingsController.js

import OrganizationSettings from '../models/OrganizationSettings.js';
import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js';
import Industry from '../models/Industry.js';
import Domain from '../models/Domain.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

/** A small tier map: 'Free'->1, 'Standard'->2, 'Enterprise'->3 */
const subTier = { Free: 1, Standard: 2, Enterprise: 3 };

/**
 * Utility function to filter the doc if ?search=... is specified.
 * We keep only items that match (Industry/Domain/Subject name or Question text),
 * plus their parent path.
 */
function filterDocBySearch(settingsDoc, search) {
  const lowerSearch = search.toLowerCase();

  // Build a new doc
  const newDoc = {
    _id: settingsDoc._id,
    orgId: settingsDoc.orgId,
    subscriptionTier: settingsDoc.subscriptionTier,
    industries: [],
    createdAt: settingsDoc.createdAt,
    updatedAt: settingsDoc.updatedAt,
    __v: settingsDoc.__v,
  };

  function matchesName(nameOrText) {
    return nameOrText.toLowerCase().includes(lowerSearch);
  }

  settingsDoc.industries.forEach((ind) => {
    const industryName = ind.industryId?.name || '';
    let industryMatches = matchesName(industryName);

    const filteredDomains = [];
    ind.domains.forEach((dom) => {
      const domainName = dom.domainId?.name || '';
      let domainMatches = matchesName(domainName);

      const filteredSubjects = [];
      dom.subjects.forEach((sub) => {
        const subjectName = sub.subjectId?.name || '';
        let subjectMatches = matchesName(subjectName);

        const filteredQuestions = [];
        sub.questions.forEach((q) => {
          const qText = q.questionId?.question_text || '';
          if (matchesName(qText)) {
            filteredQuestions.push(q);
            subjectMatches = true;
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
 * GET /organization-settings/hierarchy?search=
 * Builds or retrieves the Industry->Domain->Subject->Question doc for this org.
 * If the user’s subscription changed, we rebuild it. If ?search=..., we filter results.
 */
export async function getHierarchy(req, res) {
  try {
    const { search } = req.query;
    const org = await Organization.findById(req.user.org).populate('subscription');
    if (!org) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    const orgSubName = org.subscription?.name || 'Free';
    const orgTier = subTier[orgSubName] || 1;

    // Which subscription IDs are <= orgTier
    const allSubs = await Subscription.find({ isActive: true });
    const allowedSubIds = [];
    for (const s of allSubs) {
      const sTier = subTier[s.name] || 1;
      if (sTier <= orgTier) allowedSubIds.push(s._id);
    }

    // Check if we have existing settings
    let settings = await OrganizationSettings.findOne({ orgId: org._id })
      .populate('industries.industryId')
      .populate('industries.domains.domainId')
      .populate('industries.domains.subjects.subjectId')
      .populate('industries.domains.subjects.questions.questionId');

    if (settings) {
      const oldTier = settings.subscriptionTier || 1;
      if (oldTier !== orgTier) {
        // The subscription tier changed => rebuild
        await OrganizationSettings.deleteOne({ _id: settings._id });
        settings = null;
      }
    }

    // If no doc, build from scratch
    if (!settings) {
      const industries = await Industry.find({ subscription_id: { $in: allowedSubIds } });
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

    // If we have a doc and there's a search param, filter
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
 * Partial toggling logic for Industry, Domain, Subject, or Question.
 * This is crucial to update the .active fields and cascade if needed.
 */
export async function toggleItem(req, res) {
  try {
    const { itemType, itemId, onlyHere, newActive, parentIndustryId, parentDomainId, parentSubjectId } =
      req.body;
    const orgId = req.user.org;

    let settings = await OrganizationSettings.findOne({ orgId })
      .populate('industries.industryId')
      .populate('industries.domains.domainId')
      .populate('industries.domains.subjects.subjectId')
      .populate('industries.domains.subjects.questions.questionId');

    if (!settings) {
      return res.status(404).json({ error: 'OrganizationSettings not found for this org.' });
    }

    function cascadeIndustry(ind) {
      ind.active = newActive;
      ind.domains.forEach((dom) => {
        dom.active = newActive;
        dom.subjects.forEach((sub) => {
          sub.active = newActive;
          sub.questions.forEach((q) => {
            q.active = newActive;
          });
        });
      });
    }
    function cascadeDomain(dom) {
      dom.active = newActive;
      dom.subjects.forEach((sub) => {
        sub.active = newActive;
        sub.questions.forEach((q) => {
          q.active = newActive;
        });
      });
    }
    function cascadeSubject(sub) {
      sub.active = newActive;
      sub.questions.forEach((q) => {
        q.active = newActive;
      });
    }

    switch (itemType) {
      case 'industry': {
        // Only one reference for an industry, so onlyHere is effectively always true
        for (const ind of settings.industries) {
          if (String(ind.industryId._id) === String(itemId)) {
            cascadeIndustry(ind);
            break;
          }
        }
        break;
      }
      case 'domain': {
        if (onlyHere && parentIndustryId) {
          // Only in the specified industry
          for (const ind of settings.industries) {
            if (String(ind.industryId._id) === String(parentIndustryId)) {
              for (const dom of ind.domains) {
                if (String(dom.domainId._id) === String(itemId)) {
                  cascadeDomain(dom);
                  break;
                }
              }
              break;
            }
          }
        } else {
          // Across all references
          for (const ind of settings.industries) {
            for (const dom of ind.domains) {
              if (String(dom.domainId._id) === String(itemId)) {
                cascadeDomain(dom);
              }
            }
          }
        }
        break;
      }
      case 'subject': {
        if (onlyHere && parentIndustryId && parentDomainId) {
          // Only in that single path
          for (const ind of settings.industries) {
            if (String(ind.industryId._id) === String(parentIndustryId)) {
              for (const dom of ind.domains) {
                if (String(dom.domainId._id) === String(parentDomainId)) {
                  for (const sub of dom.subjects) {
                    if (String(sub.subjectId._id) === String(itemId)) {
                      cascadeSubject(sub);
                      break;
                    }
                  }
                  break;
                }
              }
              break;
            }
          }
        } else {
          // Across all references
          for (const ind of settings.industries) {
            for (const dom of ind.domains) {
              for (const sub of dom.subjects) {
                if (String(sub.subjectId._id) === String(itemId)) {
                  cascadeSubject(sub);
                }
              }
            }
          }
        }
        break;
      }
      case 'question': {
        if (onlyHere && parentIndustryId && parentDomainId && parentSubjectId) {
          // Only in that single path
          for (const ind of settings.industries) {
            if (String(ind.industryId._id) === String(parentIndustryId)) {
              for (const dom of ind.domains) {
                if (String(dom.domainId._id) === String(parentDomainId)) {
                  for (const sub of dom.subjects) {
                    if (String(sub.subjectId._id) === String(parentSubjectId)) {
                      for (const q of sub.questions) {
                        if (String(q.questionId._id) === String(itemId)) {
                          q.active = newActive;
                          break;
                        }
                      }
                      break;
                    }
                  }
                  break;
                }
              }
              break;
            }
          }
        } else {
          // Across all references
          for (const ind of settings.industries) {
            for (const dom of ind.domains) {
              for (const sub of dom.subjects) {
                for (const q of sub.questions) {
                  if (String(q.questionId._id) === String(itemId)) {
                    q.active = newActive;
                  }
                }
              }
            }
          }
        }
        break;
      }
      default:
        return res.status(400).json({ error: 'Invalid itemType.' });
    }

    // Save and re-populate
    await settings.save();

    const updated = await OrganizationSettings.findById(settings._id)
      .populate('industries.industryId')
      .populate('industries.domains.domainId')
      .populate('industries.domains.subjects.subjectId')
      .populate('industries.domains.subjects.questions.questionId');

    return res.json(updated);
  } catch (err) {
    console.error('Error toggling item:', err);
    return res.status(500).json({ error: 'Failed to toggle item.' });
  }
}

/**
 * POST /organization-settings/hierarchy
 * Overwrite the entire doc if you still want a full update approach
 */
export async function updateHierarchy(req, res) {
  try {
    // Just example code:
    // const { industries } = req.body;
    // const orgId = req.user.org;
    // let updated = await OrganizationSettings.findOneAndUpdate(
    //   { orgId },
    //   { industries },
    //   { new: true }
    // )
    // .populate(...);
    // return res.json(updated);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating hierarchy:', err);
    return res.status(500).json({ error: 'Failed to update hierarchy.' });
  }
}

export default {
  getHierarchy,
  toggleItem,
  updateHierarchy,
};