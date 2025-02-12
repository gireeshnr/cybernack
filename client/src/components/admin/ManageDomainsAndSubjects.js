// client/src/components/admin/ManageDomainsAndSubjects.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api'; // the api.js instance
import { connect } from 'react-redux';
import toast from 'react-hot-toast';

/**
 * A small modal for "Only Here" vs. "All references".
 * If you want partial toggles for Domain/Subject/Question, you need this.
 */
function DeactivateModal({ show, onClose, itemName, onOnlyHere, onAll }) {
  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Deactivate {itemName}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <p>
              Do you want to deactivate <strong>{itemName}</strong> only in this location,
              or across all references?
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onOnlyHere}>
              Only Here
            </button>
            <button className="btn btn-danger" onClick={onAll}>
              Across All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageDomainsAndSubjects({ organization }) {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debounced search text
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef(null);

  // For partial toggles (modal for "only here" vs "all")
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null); // { itemType, itemId, itemName, newActive, parentIDs... }

  // 1) Fetch entire or filtered hierarchy
  const fetchHierarchy = useCallback(
    async (query) => {
      try {
        setLoading(true);
        let url = '/organization-settings/hierarchy';
        if (query) {
          url += `?search=${encodeURIComponent(query)}`;
        }
        const { data } = await axios.get(url);
        setHierarchy(data);
      } catch (err) {
        console.error('Error fetching hierarchy:', err);
        toast.error('Failed to fetch hierarchy data.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // On mount, fetch with no search
  useEffect(() => {
    fetchHierarchy('');
  }, [fetchHierarchy]);

  // 2) Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchHierarchy(val);
    }, 500);
  };

  // 3) Toggle item endpoint
  async function toggleItem({
    itemType,
    itemId,
    onlyHere,
    newActive,
    parentIndustryId,
    parentDomainId,
    parentSubjectId,
  }) {
    try {
      const body = {
        itemType,
        itemId,
        onlyHere,
        newActive,
      };
      if (parentIndustryId) body.parentIndustryId = parentIndustryId;
      if (parentDomainId) body.parentDomainId = parentDomainId;
      if (parentSubjectId) body.parentSubjectId = parentSubjectId;

      const { data } = await axios.post('/organization-settings/toggle', body);
      // The server returns the updated hierarchy
      setHierarchy(data);
    } catch (err) {
      console.error('Error toggling item:', err);
      toast.error('Failed to toggle item.');
    }
  }

  // Toggle handlers

  // Industry
  const handleToggleIndustry = (indIndex) => {
    if (!hierarchy) return;
    const ind = hierarchy.industries[indIndex];
    const newVal = !ind.active;
    // Always onlyHere (since an industry is unique)
    toggleItem({
      itemType: 'industry',
      itemId: ind.industryId._id,
      onlyHere: true,
      newActive: newVal,
    });
  };

  // Domain
  const handleToggleDomain = (indIndex, domIndex) => {
    if (!hierarchy) return;
    const ind = hierarchy.industries[indIndex];
    const dom = ind.domains[domIndex];
    const newVal = !dom.active;

    if (newVal === false) {
      // Deactivate => open modal
      setModalItem({
        itemType: 'domain',
        itemId: dom.domainId._id,
        itemName: dom.domainId.name,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
      });
      setShowModal(true);
    } else {
      // Re-activate => do onlyHere
      toggleItem({
        itemType: 'domain',
        itemId: dom.domainId._id,
        onlyHere: true,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
      });
    }
  };

  // Subject
  const handleToggleSubject = (indIndex, domIndex, subIndex) => {
    if (!hierarchy) return;
    const ind = hierarchy.industries[indIndex];
    const dom = ind.domains[domIndex];
    const sub = dom.subjects[subIndex];
    const newVal = !sub.active;

    if (newVal === false) {
      setModalItem({
        itemType: 'subject',
        itemId: sub.subjectId._id,
        itemName: sub.subjectId.name,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
        parentDomainId: dom.domainId._id,
      });
      setShowModal(true);
    } else {
      toggleItem({
        itemType: 'subject',
        itemId: sub.subjectId._id,
        onlyHere: true,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
        parentDomainId: dom.domainId._id,
      });
    }
  };

  // Question
  const handleToggleQuestion = (indIndex, domIndex, subIndex, qIndex) => {
    if (!hierarchy) return;
    const ind = hierarchy.industries[indIndex];
    const dom = ind.domains[domIndex];
    const sub = dom.subjects[subIndex];
    const q = sub.questions[qIndex];
    const newVal = !q.active;

    if (newVal === false) {
      setModalItem({
        itemType: 'question',
        itemId: q.questionId._id,
        itemName: q.questionId.question_text,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
        parentDomainId: dom.domainId._id,
        parentSubjectId: sub.subjectId._id,
      });
      setShowModal(true);
    } else {
      toggleItem({
        itemType: 'question',
        itemId: q.questionId._id,
        onlyHere: true,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
        parentDomainId: dom.domainId._id,
        parentSubjectId: sub.subjectId._id,
      });
    }
  };

  // Modal close
  const handleModalClose = () => {
    setShowModal(false);
    setModalItem(null);
  };

  // "Only Here"
  const handleOnlyHere = () => {
    if (!modalItem) return;
    toggleItem({
      itemType: modalItem.itemType,
      itemId: modalItem.itemId,
      onlyHere: true,
      newActive: modalItem.newActive,
      parentIndustryId: modalItem.parentIndustryId,
      parentDomainId: modalItem.parentDomainId,
      parentSubjectId: modalItem.parentSubjectId,
    });
    handleModalClose();
  };

  // "Across All"
  const handleAll = () => {
    if (!modalItem) return;
    toggleItem({
      itemType: modalItem.itemType,
      itemId: modalItem.itemId,
      onlyHere: false,
      newActive: modalItem.newActive,
    });
    handleModalClose();
  };

  // Render
  if (loading) return <div>Loading hierarchy...</div>;
  if (!hierarchy) return <div>No hierarchy data.</div>;

  return (
    <div className="container mt-3">
      <h2>Manage Domains & Subjects</h2>
      <p>
        Use the search box to filter items. Toggle each item to activate/deactivate.
        Debounced search means you won't lose focus.
      </p>

      {/* Debounced search box */}
      <div className="mb-3">
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          className="form-control"
          placeholder="Search..."
        />
      </div>

      {hierarchy.industries?.map((ind, iInd) => (
        <div key={ind.industryId?._id || iInd} className="border p-2 mb-2">
          <div>
            <input
              type="checkbox"
              checked={ind.active}
              onChange={() => handleToggleIndustry(iInd)}
              id={`ind-${iInd}`}
            />
            <label htmlFor={`ind-${iInd}`} className="ms-2 fw-bold">
              {ind.industryId?.name || 'Unnamed Industry'}
            </label>
          </div>
          <div style={{ marginLeft: '1.5rem' }}>
            {ind.domains.map((dom, iDom) => (
              <div key={dom.domainId?._id || iDom} className="mb-1">
                <input
                  type="checkbox"
                  checked={dom.active}
                  onChange={() => handleToggleDomain(iInd, iDom)}
                  id={`dom-${iInd}-${iDom}`}
                />
                <label htmlFor={`dom-${iInd}-${iDom}`} className="ms-1 fw-semibold">
                  {dom.domainId?.name || 'Unnamed Domain'}
                </label>

                <div style={{ marginLeft: '1.5rem' }}>
                  {dom.subjects.map((sub, iSub) => (
                    <div key={sub.subjectId?._id || iSub} className="mb-1">
                      <input
                        type="checkbox"
                        checked={sub.active}
                        onChange={() => handleToggleSubject(iInd, iDom, iSub)}
                        id={`sub-${iInd}-${iDom}-${iSub}`}
                      />
                      <label
                        htmlFor={`sub-${iInd}-${iDom}-${iSub}`}
                        className="ms-1"
                      >
                        {sub.subjectId?.name || 'Unnamed Subject'}
                      </label>

                      <div style={{ marginLeft: '1.5rem' }}>
                        {sub.questions.map((q, iQ) => (
                          <div key={q.questionId?._id || iQ} className="form-check mb-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`q-${iInd}-${iDom}-${iSub}-${iQ}`}
                              checked={q.active}
                              onChange={() => handleToggleQuestion(iInd, iDom, iSub, iQ)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`q-${iInd}-${iDom}-${iSub}-${iQ}`}
                            >
                              {q.questionId?.question_text || 'Unnamed Question'}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* "Only Here" vs. "All" Modal */}
      <DeactivateModal
        show={showModal}
        onClose={handleModalClose}
        itemName={modalItem?.itemName}
        onOnlyHere={handleOnlyHere}
        onAll={handleAll}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  organization: state.auth.profile?.organization,
});

export default connect(mapStateToProps)(ManageDomainsAndSubjects);