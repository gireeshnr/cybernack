// client/src/components/admin/ManageDomainsAndSubjects.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api'; // the api.js instance
import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

/**
 * A small modal for "Only Here" vs. "All references".
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

/**
 * Helper to render an ownership badge:
 * - If the record's ownerOrgId exists and equals the current organization's _id, show "Locally Added".
 * - If the user is superadmin and the record is owned by another org, display "Added by [OrgName]".
 */
function renderOwnerBadge(entity, currentOrgId, userRole) {
  if (!entity?.ownerOrgId) return null;
  const owner = entity.ownerOrgId;
  if (currentOrgId && owner._id === currentOrgId) {
    return <span className="badge bg-success ms-2">Locally Added</span>;
  } else if (userRole === 'superadmin' && owner.name) {
    return <span className="badge bg-info ms-2">Added by {owner.name}</span>;
  }
  return null;
}

function ManageDomainsAndSubjects({ organization, role }) {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  // Fetch hierarchy (optionally filtered by search)
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

  useEffect(() => {
    fetchHierarchy('');
  }, [fetchHierarchy]);

  // Debounced search change handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchHierarchy(val);
    }, 500);
  };

  // Toggle item handler
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
    } catch (err) {
      console.error('Error toggling item:', err);
      toast.error('Failed to toggle item.');
    }
  }

  // Handlers for toggles
  const handleToggleIndustry = (indIndex) => {
    if (!hierarchy) return;
    const ind = hierarchy.industries[indIndex];
    const newVal = !ind.active;
    toggleItem({
      itemType: 'industry',
      itemId: ind.industryId._id,
      onlyHere: true,
      newActive: newVal,
    });
  };

  const handleToggleDomain = (indIndex, domIndex) => {
    if (!hierarchy) return;
    const ind = hierarchy.industries[indIndex];
    const dom = ind.domains[domIndex];
    const newVal = !dom.active;
    if (newVal === false) {
      setModalItem({
        itemType: 'domain',
        itemId: dom.domainId._id,
        itemName: dom.domainId.name,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
      });
      setShowModal(true);
    } else {
      toggleItem({
        itemType: 'domain',
        itemId: dom.domainId._id,
        onlyHere: true,
        newActive: newVal,
        parentIndustryId: ind.industryId._id,
      });
    }
  };

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

  // Modal handlers
  const handleModalClose = () => {
    setShowModal(false);
    setModalItem(null);
  };

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
      <p>
        Use the search box to filter items. Toggle each item to activate/deactivate.
      </p>
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
            {renderOwnerBadge(ind.industryId, organization?._id, role)}
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
                {renderOwnerBadge(dom.domainId, organization?._id, role)}
                <div style={{ marginLeft: '1.5rem' }}>
                  {dom.subjects.map((sub, iSub) => (
                    <div key={sub.subjectId?._id || iSub} className="mb-1">
                      <input
                        type="checkbox"
                        checked={sub.active}
                        onChange={() => handleToggleSubject(iInd, iDom, iSub)}
                        id={`sub-${iInd}-${iDom}-${iSub}`}
                      />
                      <label htmlFor={`sub-${iInd}-${iDom}-${iSub}`} className="ms-1">
                        {sub.subjectId?.name || 'Unnamed Subject'}
                      </label>
                      {renderOwnerBadge(sub.subjectId, organization?._id, role)}
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
                            {renderOwnerBadge(q.questionId, organization?._id, role)}
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
  role: state.auth.profile?.role,
});

export default connect(mapStateToProps)(ManageDomainsAndSubjects);