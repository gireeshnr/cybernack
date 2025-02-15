// client/src/components/admin/BulkUpload.js
import React, { useState } from 'react';
import { connect } from 'react-redux';
import axios from '../../api';
import { toast } from 'react-hot-toast';

function BulkUpload({ role }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div className="container mt-3">
      <h2>Bulk Upload {role === 'superadmin' ? '(Superadmin)' : '(Admin)'}</h2>
      <p>
        Download the CSV template, fill in your industries, domains, subjects, and questions,
        then upload to insert them in bulk.
      </p>
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