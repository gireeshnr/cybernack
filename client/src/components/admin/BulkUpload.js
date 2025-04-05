// client/src/components/admin/BulkUpload.js
import React, { useState } from 'react';
import { connect } from 'react-redux';
import axios from '../../api';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function BulkUpload({ role }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('/bulk-upload/template', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk_upload_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded!');
    } catch (err) {
      console.error('Error downloading template:', err);
      toast.error('Failed to download template.');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      const response = await axios.post('/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Upload successful!');
    } catch (err) {
      console.error('Error uploading CSV:', err);
      toast.error('Failed to upload CSV.');
    } finally {
      setUploading(false);
    }
  };

  const toggleGuidance = () => {
    setShowGuidance((prev) => !prev);
  };

  return (
    <div className="container mt-3">
      <div className="d-flex align-items-center justify-content-between">
        <h2>Bulk Upload {role === 'superadmin' ? '(Superadmin)' : '(Admin)'}</h2>
        <button
          onClick={toggleGuidance}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          title="Upload Guidance"
        >
          <FontAwesomeIcon icon={faInfoCircle} size="lg" color="#007bff" />
        </button>
      </div>

      {/* Guidance Panel */}
      {showGuidance && (
        <div
          className="bulk-upload-guidance p-3 mb-3"
          style={{
            border: '1px solid #007bff',
            borderRadius: '4px',
            backgroundColor: '#e9f7fd',
          }}
        >
          <h5>Bulk Upload Template Instructions</h5>
          <ul>
            <li>
              <strong>Domain Name:</strong> Enter the exact name of the domain (e.g., “PCI DSS”). This field is mandatory.
            </li>
            <li>
              <strong>Domain Description:</strong> Provide a brief description of the domain (e.g., “Standards for payment card data security”).
            </li>
            <li>
              <strong>Subject Name:</strong> Enter the subject name exactly as it should appear (e.g., “Data Storage”).
            </li>
            <li>
              <strong>Subject Description:</strong> Provide a concise description for the subject (e.g., “Guidelines for secure storage of cardholder data”).
            </li>
            <li>
              <strong>Short Question Snippet:</strong> Enter a brief snippet for the question (up to about 100 characters).
            </li>
            <li>
              <strong>Full Question Text:</strong> Optionally provide a detailed question text. If left blank, a default snippet will be used.
            </li>
            <li>
              <strong>Option A, B, C, D:</strong> Provide exactly four answer options. Each option must be non-empty and distinct.
            </li>
            <li>
              <strong>Correct Answer:</strong> Specify the correct answer by entering A, B, C, or D. This must exactly match one of the options.
            </li>
            <li>
              <strong>Difficulty:</strong> Enter one of the following values: “Easy”, “Medium”, or “Hard”.
            </li>
            <li>
              <strong>Explanation:</strong> Optionally provide an explanation for the correct answer. Use this field to clarify why the chosen answer is correct.
            </li>
            {role === 'superadmin' && (
              <li>
                <strong>Subscription:</strong> For superadmin users only, include the subscription level (e.g., “Enterprise”). This value must match an existing subscription record.
              </li>
            )}
          </ul>
          <p>
            Ensure that every row in your CSV file follows this exact order and format. Incorrect or missing values in any field will cause the bulk upload to fail.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={toggleGuidance}>
            Close Guidance
          </button>
        </div>
      )}

      <button className="btn btn-primary mb-3" onClick={handleDownloadTemplate}>
        Download Template
      </button>
      <div className="mb-3">
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>
      <button className="btn btn-success" onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload CSV'}
      </button>
    </div>
  );
}

const mapStateToProps = (state) => ({
  role: state.auth.profile?.role,
});

export default connect(mapStateToProps)(BulkUpload);