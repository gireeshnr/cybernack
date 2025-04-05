// server/src/controllers/contentController.js
import Industry from '../models/Industry.js';
import Domain from '../models/Domain.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import Organization from '../models/Organization.js';

/**
 * GET /content
 * Retrieves and merges content based on the requesting user's role.
 * For superadmins: merges global (ownerOrgId = "Cybernack") and client-specific content.
 * For client admins: only returns content for their own organization.
 * Each question is tagged with a `source` property ("global" or "local").
 */
export async function getCombinedContent(req, res) {
  try {
    const userOrgId = req.user.org;
    const role = req.user.role;

    // For non-superadmins, only use their own organization.
    if (role !== 'superadmin') {
      // Retrieve industries for this organization only.
      const industries = await Industry.find({ ownerOrgId: userOrgId }).lean();
      // For each industry, populate domains, subjects, and questions.
      // (For brevity, here we assume you build the hierarchy similarly,
      // but scoped only to ownerOrgId === userOrgId)
      // You can implement a simpler merging here since there's no global overlay.
      const hierarchy = await Promise.all(
        industries.map(async (ind) => {
          const domains = await Domain.find({ ownerOrgId: userOrgId, industries: ind._id }).lean();
          const mergedDomains = await Promise.all(
            domains.map(async (dom) => {
              const subjects = await Subject.find({ ownerOrgId: userOrgId, domain_id: dom._id }).lean();
              const mergedSubjects = await Promise.all(
                subjects.map(async (sub) => {
                  const questions = await Question.find({ ownerOrgId: userOrgId, subject_id: sub._id }).lean();
                  // Tag all as "local"
                  const taggedQuestions = questions.map(q => ({ ...q, source: 'local' }));
                  return { ...sub, questions: taggedQuestions };
                })
              );
              return { ...dom, subjects: mergedSubjects };
            })
          );
          return { ...ind, domains: mergedDomains };
        })
      );
      return res.json({ industries: hierarchy });
    }

    // If superadmin, merge global and client-specific content.
    // Find the global organization ("Cybernack")
    const globalOrg = await Organization.findOne({ name: 'Cybernack' });
    if (!globalOrg) {
      return res.status(500).json({ error: 'Global organization not found' });
    }

    // Retrieve industries belonging to either the global org or the client org
    const industries = await Industry.find({ ownerOrgId: { $in: [globalOrg._id, userOrgId] } }).lean();

    // Merge industries by name
    const mergedIndustries = {};
    industries.forEach(ind => {
      const name = ind.name.trim();
      if (!mergedIndustries[name]) {
        mergedIndustries[name] = {
          name,
          global: ind.ownerOrgId.equals(globalOrg._id) ? ind : null,
          local: ind.ownerOrgId.equals(userOrgId) ? ind : null,
          domains: {}
        };
      } else {
        if (ind.ownerOrgId.equals(globalOrg._id)) {
          mergedIndustries[name].global = ind;
        } else if (ind.ownerOrgId.equals(userOrgId)) {
          mergedIndustries[name].local = ind;
        }
      }
    });

    // For each merged industry, merge domains from global and client records
    const industryNames = Object.keys(mergedIndustries);
    for (const indName of industryNames) {
      const mergedInd = mergedIndustries[indName];

      // Global domains for this industry (if exists)
      if (mergedInd.global) {
        const globalDomains = await Domain.find({ ownerOrgId: globalOrg._id, industries: mergedInd.global._id }).lean();
        globalDomains.forEach(dom => {
          const dname = dom.name.trim();
          if (!mergedInd.domains[dname]) {
            mergedInd.domains[dname] = { name: dname, global: dom, local: null, subjects: {} };
          } else {
            mergedInd.domains[dname].global = dom;
          }
        });
      }

      // Client domains for this industry (if exists)
      if (mergedInd.local) {
        const localDomains = await Domain.find({ ownerOrgId: userOrgId, industries: mergedInd.local._id }).lean();
        localDomains.forEach(dom => {
          const dname = dom.name.trim();
          if (!mergedInd.domains[dname]) {
            mergedInd.domains[dname] = { name: dname, global: null, local: dom, subjects: {} };
          } else {
            mergedInd.domains[dname].local = dom;
          }
        });
      }

      // For each merged domain, merge subjects
      const domainNames = Object.keys(mergedInd.domains);
      for (const dname of domainNames) {
        const mergedDom = mergedInd.domains[dname];
        if (mergedDom.global) {
          const globalSubjects = await Subject.find({ ownerOrgId: globalOrg._id, domain_id: mergedDom.global._id }).lean();
          globalSubjects.forEach(sub => {
            const sname = sub.name.trim();
            if (!mergedDom.subjects[sname]) {
              mergedDom.subjects[sname] = { name: sname, global: sub, local: null, questions: [] };
            } else {
              mergedDom.subjects[sname].global = sub;
            }
          });
        }
        if (mergedDom.local) {
          const localSubjects = await Subject.find({ ownerOrgId: userOrgId, domain_id: mergedDom.local._id }).lean();
          localSubjects.forEach(sub => {
            const sname = sub.name.trim();
            if (!mergedDom.subjects[sname]) {
              mergedDom.subjects[sname] = { name: sname, global: null, local: sub, questions: [] };
            } else {
              mergedDom.subjects[sname].local = sub;
            }
          });
        }

        // For each merged subject, merge questions and tag them with source
        const subjectNames = Object.keys(mergedDom.subjects);
        for (const sname of subjectNames) {
          const mergedSub = mergedDom.subjects[sname];
          let globalQuestions = [];
          let localQuestions = [];
          if (mergedSub.global) {
            globalQuestions = await Question.find({ ownerOrgId: globalOrg._id, subject_id: mergedSub.global._id }).lean();
          }
          if (mergedSub.local) {
            localQuestions = await Question.find({ ownerOrgId: userOrgId, subject_id: mergedSub.local._id }).lean();
          }
          globalQuestions = globalQuestions.map(q => ({ ...q, source: 'global' }));
          localQuestions = localQuestions.map(q => ({ ...q, source: 'local' }));
          mergedSub.questions = [...globalQuestions, ...localQuestions];
        }
      }
    }

    const mergedHierarchy = Object.keys(mergedIndustries).map(indName => {
      const ind = mergedIndustries[indName];
      return {
        name: ind.name,
        global: ind.global,
        local: ind.local,
        domains: Object.keys(ind.domains).map(dname => {
          const dom = ind.domains[dname];
          return {
            name: dom.name,
            global: dom.global,
            local: dom.local,
            subjects: Object.keys(dom.subjects).map(sname => {
              const sub = dom.subjects[sname];
              return {
                name: sub.name,
                global: sub.global,
                local: sub.local,
                questions: sub.questions
              };
            })
          };
        })
      };
    });

    return res.json({ industries: mergedHierarchy });
  } catch (err) {
    console.error('Error in getCombinedContent:', err);
    return res.status(500).json({ error: 'Failed to retrieve combined content.' });
  }
}