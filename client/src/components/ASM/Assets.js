import React, { useState, useEffect } from 'react';
import { fetchAssets, autoDiscovery, addOrUpdateAssets, fetchRootDomainFromOrg, deleteAssets, updateAsset } from '../../utils/api';
import AssetList from './AssetList';
import EditAssetModal from './EditAssetModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ConfirmationModal from './ConfirmationModal';
import ToastNotification from './ToastNotification';
import { Spinner } from 'react-bootstrap';
import './Assets.css';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [editAsset, setEditAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmRefresh, setShowConfirmRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [rootDomain, setRootDomain] = useState('');

  useEffect(() => {
    loadAssets();
    fetchRootDomain();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await fetchAssets();
      setAssets(response.data.map(asset => ({ ...asset, isNew: false })));
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError('Error fetching assets');
      setShowToast(true);
    }
  };

  const fetchRootDomain = async () => {
    try {
      const response = await fetchRootDomainFromOrg();
      setRootDomain(response["Root Domain"]);
    } catch (error) {
      console.error('Error fetching root domain:', error);
    }
  };

  const handleAutoDiscovery = async () => {
    setLoading(true);
    setError('');
    setShowToast(false);
    
    try {
      if (!rootDomain) {
        throw new Error('Root domain is not available');
      }
      const response = await autoDiscovery(rootDomain);
      const newAssets = response.data.assets.filter(newAsset => !assets.some(asset => asset.domain === newAsset.domain));
  
      if (newAssets.length > 0) {
        await addOrUpdateAssets(newAssets);
        setAssets([...assets, ...newAssets.map(asset => ({ ...asset, isNew: true }))]);
        setMessage(`Discovery completed successfully with ${newAssets.length} new assets identified.`);
      } else {
        setMessage('No new assets found during discovery.');
      }
  
    } catch (error) {
      console.error('Error during auto discovery:', error);
      setError(`Error during discovery: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setShowToast(true);
    }
  };

  const handleSelectAsset = (assetId) => {
    setSelectedAssets((prevSelected) => {
      if (prevSelected.includes(assetId)) {
        return prevSelected.filter((id) => id !== assetId);
      } else {
        return [...prevSelected, assetId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((asset) => asset._id));
    }
  };

  const handleDeleteAssets = () => {
    setShowConfirmation(true);
  };

  const confirmDeleteAssets = async () => {
    try {
      await deleteAssets(selectedAssets);
      const updatedAssets = assets.filter((asset) => !selectedAssets.includes(asset._id));
      setAssets(updatedAssets);
      setSelectedAssets([]);
      setShowConfirmation(false);
      setMessage('Assets deleted successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting assets:', error);
      setError('Error deleting assets');
      setShowToast(true);
    }
  };

  const handleEditAsset = (asset) => {
    setEditAsset(asset);
    setShowModal(true);
  };

  const handleUpdateAsset = async () => {
    try {
      const response = await updateAsset({
        assetId: editAsset._id,
        domain: editAsset.domain,
        type: editAsset.type,
        ip: editAsset.ip,
        ports: editAsset.ports,
      });
      const updatedAssets = assets.map((asset) =>
        asset._id === editAsset._id ? response.data.asset : asset
      );
      setAssets(updatedAssets);
      setEditAsset(null);
      setShowModal(false);
      setMessage('Asset updated successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating asset:', error);
      setError('Error updating asset');
      setShowToast(true);
    }
  };

  const handleFilterChange = (e, field) => {
    const value = e.target.value.toLowerCase();
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    const filtered = applyFilters(assets, newFilters);
    setFilteredAssets(filtered);
  };

  return (
    <div>
      <h1>Assets</h1>
      {loading && (
        <div className="loading-indicator">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      )}
      <AssetList 
        assets={assets} 
        selectedAssets={selectedAssets} 
        handleSelectAsset={handleSelectAsset} 
        handleSelectAll={handleSelectAll} 
        handleFilterChange={handleFilterChange}
        handleEditAsset={handleEditAsset}
        handleDeleteAssets={handleDeleteAssets}
        handleRefresh={() => setShowConfirmRefresh(true)} // Trigger confirmation before refresh
      />
      <ToastNotification showToast={showToast} setShowToast={setShowToast} message={message} error={error} />
      {editAsset && (
        <EditAssetModal
          editAsset={editAsset}
          setEditAsset={setEditAsset}
          showModal={showModal}
          setShowModal={setShowModal}
          handleUpdateAsset={handleUpdateAsset}
        />
      )}
      <ConfirmDeleteModal
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        confirmDeleteAssets={confirmDeleteAssets}
      />
      <ConfirmationModal
        show={showConfirmRefresh}
        onHide={() => setShowConfirmRefresh(false)}
        onConfirm={() => {
          setShowConfirmRefresh(false);
          handleAutoDiscovery();
        }}
        domain={rootDomain}
      />
    </div>
  );
};

export default Assets;
