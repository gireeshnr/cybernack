import React, { useState } from 'react';
import { connect } from 'react-redux';
import { createOrganization } from '../../auth/actions';  // Action to create org
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const CreateOrganization = (props) => {
  const [formData, setFormData] = useState({
    orgName: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',  // Password if bypassing activation
    bypassActivation: false  // Toggle state
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setFormData({ ...formData, bypassActivation: !formData.bypassActivation });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await props.createOrganization(formData);
      toast.success('Organization created successfully!');
      navigate('/superadmin/dashboard');  // Redirect after success
    } catch (error) {
      toast.error('Error creating organization. Please try again.');
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
            required
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.bypassActivation}
              onChange={handleToggle}
            />
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
              required
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Create Organization'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default connect(null, { createOrganization })(CreateOrganization);