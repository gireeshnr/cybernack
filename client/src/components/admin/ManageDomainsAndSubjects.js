import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api';
import { connect } from 'react-redux';
import toast from 'react-hot-toast';

/** A small modal for "Only Here" vs. "All" deactivation. */
function DeactivateModal({ show, onClose, itemName, onOnlyHere, onAll }) {
  if (!show) return null;

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} role="dialog">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Deactivate {itemName}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
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

/**
 * Main Page
 */
function ManageDomainsAndSubjects({ organization }) {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);

  // For toggling: "Only Here" vs. "All"
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null); // { itemType, itemId, parent..., itemName, newActive }

  // The user’s search text
  const [searchText, setSearchText] = useState('');
  // Debounce timer reference
  const debounceRef = useRef(null);

  /**
   * Fetch entire or filtered hierarchy from the server
   * using ?search=someQuery for server‐side filtering
   */
  const fetchHierarchy = useCallback(
    async (query) => {
      setLoading(true);
      try {
        let url = '/organization-settings/hierarchy';
        if (query) {
          url += `?search=${encodeURIComponent(query)}`;
        }
        const { data } = await axios.get(url);
        setHierarchy(data);
      } catch (err) {
        console.error('Error fetching hierarchy:', err);
        toast.error('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    },
    [setHierarchy]
  );

  // On mount, load data once
  useEffect(() => {
    fetchHierarchy('');
  }, [fetchHierarchy]);

  // Handle text input changes (debounced)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);

    // Clear any existing timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set a new timer
    debounceRef.current = setTimeout(() => {
      // Actually fetch from server after 500ms idle
      fetchHierarchy(val);
    }, 500);
  };

  /**
   * Call the server to toggle an item
   */
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
      setHierarchy(data);
      toast.success('Item toggled successfully.');
    } catch (err) {
      console.error('Error toggling item:', err);
      toast.error('Failed to toggle item.');
    }
  }

  // ========== Toggle Handlers ==========

  // Industry (always cascade in single location)
  const handleToggleIndustry = (indIndex) => {
    if (!hierarchy) return;
    const industry = hierarchy.industries[indIndex];
    const newVal = !industry.active;

    toggleItem({
      itemType: 'industry',
      itemId: industry.industryId._id,
      onlyHere: true, // no cross-industry concept for an industry
      newActive: newVal,
    });
  };

  // Domain
  const handleToggleDomain = (indIndex, domIndex) => {
    const industry = hierarchy.industries[indIndex];
    const domain = industry.domains[domIndex];
    const newVal = !domain.active;

    if (newVal === false) {
      // Deactivating => show "only here or all references?"
      setModalItem({
        itemType: 'domain',
        itemId: domain.domainId._id,
        itemName: domain.domainId.name,
        newActive: newVal,
        parentIndustryId: industry.industryId._id,
      });
      setShowModal(true);
    } else {
      // Activating => do it only here
      toggleItem({
        itemType: 'domain',
        itemId: domain.domainId._id,
        onlyHere: true,
        newActive: newVal,
        parentIndustryId: industry.industryId._id,
      });
    }
  };

  // Subject
  const handleToggleSubject = (indIndex, domIndex, subIndex) => {
    const industry = hierarchy.industries[indIndex];
    const domain = industry.domains[domIndex];
    const subject = domain.subjects[subIndex];
    const newVal = !subject.active;

    if (!newVal) {
      // Deactivate => modal
      setModalItem({
        itemType: 'subject',
        itemId: subject.subjectId._id,
        itemName: subject.subjectId.name,
        newActive: newVal,
        parentIndustryId: industry.industryId._id,
        parentDomainId: domain.domainId._id,
      });
      setShowModal(true);
    } else {
      // Activate => only here
      toggleItem({
        itemType: 'subject',
        itemId: subject.subjectId._id,
        onlyHere: true,
        newActive: newVal,
        parentIndustryId: industry.industryId._id,
        parentDomainId: domain.domainId._id,
      });
    }
  };

  // Question
  const handleToggleQuestion = (indIndex, domIndex, subIndex, qIndex) => {
    const industry = hierarchy.industries[indIndex];
    const domain = industry.domains[domIndex];
    const subject = domain.subjects[subIndex];
    const question = subject.questions[qIndex];
    const newVal = !question.active;

    if (!newVal) {
      setModalItem({
        itemType: 'question',
        itemId: question.questionId._id,
        itemName: question.questionId.question_text,
        newActive: newVal,
        parentIndustryId: industry.industryId._id,
        parentDomainId: domain.domainId._id,
        parentSubjectId: subject.subjectId._id,
      });
      setShowModal(true);
    } else {
      toggleItem({
        itemType: 'question',
        itemId: question.questionId._id,
        onlyHere: true,
        newActive: newVal,
        parentIndustryId: industry.industryId._id,
        parentDomainId: domain.domainId._id,
        parentSubjectId: subject.subjectId._id,
      });
    }
  };

  // Modal close
  const handleModalClose = () => {
    setShowModal(false);
    setModalItem(null);
  };
  // Only here
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
  // All references
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

  if (loading) return <div>Loading hierarchy...</div>;
  if (!hierarchy) return <div>No hierarchy data.</div>;

  return (
    <div className="container mt-3">
      <h2>Manage Domains & Subjects</h2>
      <p>Search or browse the hierarchy below to toggle items.</p>

      {/* The search box (debounced) */}
      <div className="mb-3">
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          className="form-control"
          placeholder="Type to search..."
        />
      </div>

      {hierarchy.industries?.length > 0 ? (
        hierarchy.industries.map((ind, iInd) => (
          <div key={ind.industryId?._id || iInd} className="border p-2 mb-2">
            <div>
              <input
                type="checkbox"
                checked={ind.active}
                onChange={() => handleToggleIndustry(iInd)}
                id={`industry-${iInd}`}
              />
              <label htmlFor={`industry-${iInd}`} className="ms-2 fw-bold">
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
                    id={`domain-${iInd}-${iDom}`}
                  />
                  <label htmlFor={`domain-${iInd}-${iDom}`} className="ms-1 fw-semibold">
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
        ))
      ) : (
        <p className="text-muted">No matching items.</p>
      )}

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