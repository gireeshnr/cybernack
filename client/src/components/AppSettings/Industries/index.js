import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from '../../../reducers/industrySlice'; // Renamed from entitySlice
import IndustryTable from './IndustryTable'; // Renamed from EntityTable
import IndustryForm from './IndustryForm';   // Renamed from EntityForm

const IndustryPage = () => {
  const dispatch = useDispatch();
  const { industries } = useSelector((state) => state.industries); 
  // ^ previously state.entities

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchIndustries());
  }, [dispatch]);

  const handleEdit = (industry) => {
    setFormData({ name: industry.name, description: industry.description });
    setEditingId(industry._id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteIndustry(id));
  };

  const handleSubmit = () => {
    if (isEditing) {
      // Passing the 'industry' data along with the ID
      dispatch(updateIndustry({ id: editingId, industryData: formData }));
    } else {
      dispatch(createIndustry(formData));
    }
    setFormData({ name: '', description: '' });
    setIsEditing(false);
  };

  return (
    <div>
      <h2>Industries</h2>
      <IndustryForm
        isEditing={isEditing}
        data={formData}
        setData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={false}
        onCancel={() => {
          setFormData({ name: '', description: '' });
          setIsEditing(false);
        }}
      />
      <IndustryTable industries={industries} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default IndustryPage;