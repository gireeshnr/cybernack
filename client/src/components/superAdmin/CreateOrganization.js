import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createOrganization } from '../../auth/actions';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateOrganization = ({ createOrganization }) => {
  const [formData, setFormData] = useState({
    orgName: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    bypassActivation: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      bypassActivation: !prev.bypassActivation,
      adminPassword: '', // Reset adminPassword when toggling off
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createOrganization(formData);
      toast.success('Organization created successfully!');
      navigate('/superadmin/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error creating organization. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-organization">
      <h2>Create Organization</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Organization Name:</label>
          <input
            type="text"
            name="orgName"
            value={formData.orgName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter organization name"
            required
          />
        </div>
        <div className="form-group">
          <label>Admin First Name:</label>
          <input
            type="text"
            name="adminFirstName"
            value={formData.adminFirstName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter admin's first name"
            required
          />
        </div>
        <div className="form-group">
          <label>Admin Last Name:</label>
          <input
            type="text"
            name="adminLastName"
            value={formData.adminLastName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter admin's last name"
            required
          />
        </div>
        <div className="form-group">
          <label>Admin Email:</label>
          <input
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter admin's email"
            required
          />
        </div>
        <div className="form-group form-check">
          <input
            type="checkbox"
            id="bypassActivation"
            className="form-check-input"
            checked={formData.bypassActivation}
            onChange={handleToggle}
          />
          <label htmlFor="bypassActivation" className="form-check-label">
            Bypass Email Verification
          </label>
        </div>
        {formData.bypassActivation && (
          <div className="form-group">
            <label>Admin Password:</label>
            <input
              type="password"
              name="adminPassword"
              value={formData.adminPassword}
              onChange={handleChange}
              className="form-control"
              placeholder="Set admin password"
              required
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
};

// PropTypes validation
CreateOrganization.propTypes = {
  createOrganization: PropTypes.func.isRequired,
};

export default connect(null, { createOrganization })(CreateOrganization);