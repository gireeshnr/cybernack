import React, { useState, useEffect } from 'react';
import { fetchAssets, autoDiscovery, addOrUpdateAssets, deleteAssets, updateAsset } from '../../utils/api';
import { applyFilters } from '../../utils/filters';
import { isValidDomainOrIP } from '../../utils/validators';
import AssetList from './AssetList';
import AutoDiscovery from './AutoDiscovery';
import DiscoveryResults from './DiscoveryResults';
import AddNewAsset from './AddNewAsset';
import EditAssetModal from './EditAssetModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ToastNotification from './ToastNotification';
import { Tabs, Tab } from 'react-bootstrap'; // Import Tabs and Tab from react-bootstrap
import './Assets.css'; // Import the CSS file

const Assets = () => {
  const [domain, setDomain] = useState('');
  const [assets, setAssets] = useState([]);
  const [discoveryAssets, setDiscoveryAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [filteredDiscoveryAssets, setFilteredDiscoveryAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [selectedDiscoveryAssets, setSelectedDiscoveryAssets] = useState([]);
  const [editAsset, setEditAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [newAsset, setNewAsset] = useState({
    domain: '',
    type: '',
    ip: '',
    ports: '',
  });

  const [filters, setFilters] = useState({
    domain: '',
    type: '',
    ip: '',
    ports: '',
  });

  const [discoveryFilters, setDiscoveryFilters] = useState({
    domain: '',
    type: '',
    ip: '',
    ports: '',
    status: '',
  });

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await fetchAssets();
        setAssets(response.data);
        setFilteredAssets(response.data);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Error fetching assets');
        setShowToast(true);
      }
    };

    loadAssets();
  }, []);

  const handleAutoDiscovery = async () => {
    if (!domain) {
      setError('Domain or IP address is required for discovery.');
      setShowToast(true);
      return;
    }
    if (!isValidDomainOrIP(domain)) {
      setError('Invalid domain or IP address format.');
      setShowToast(true);
      return;
    }

    setLoading(true); // Start loading spinner
    setError('');
    setShowToast(false);

    try {
      const response = await autoDiscovery(domain);
      const discoveredAssets = response.data.assets;
      if (discoveredAssets.length === 0) {
        setError('No assets found for the provided domain.');
        setShowToast(true);
      } else {
        const updatedDiscoveryAssets = discoveredAssets.map((asset) => {
          const existingAsset = assets.find((a) => a.domain === asset.domain);
          return {
            ...asset,
            status: existingAsset ? 'Existing' : 'New',
          };
        });
        setDiscoveryAssets(updatedDiscoveryAssets);
        setFilteredDiscoveryAssets(updatedDiscoveryAssets);
        setMessage('Discovery completed successfully.');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error during auto discovery:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Error during discovery: ${error.response.data.error}`);
      } else if (error.message) {
        setError(`Error during discovery: ${error.message}`);
      } else {
        setError('An unexpected error occurred during discovery.');
      }
      setShowToast(true);
    } finally {
      setLoading(false); // Stop loading spinner
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
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map((asset) => asset._id));
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
      setFilteredAssets(updatedAssets);
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
      setFilteredAssets(updatedAssets);
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

  const handleSelectDiscoveryAsset = (asset) => {
    setSelectedDiscoveryAssets((prevSelected) => {
      if (prevSelected.includes(asset)) {
        return prevSelected.filter((a) => a !== asset);
      } else {
        return [...prevSelected, asset];
      }
    });
  };

  const handleAddToAssetRegistry = async () => {
    try {
      const newAssets = selectedDiscoveryAssets.filter((asset) => asset.status === 'New');
      const existingAssets = selectedDiscoveryAssets.filter((asset) => asset.status === 'Existing');

      await addOrUpdateAssets([...newAssets, ...existingAssets]);

      const updatedAssets = await fetchAssets();
      setAssets(updatedAssets.data);
      setFilteredAssets(updatedAssets.data);
      setDiscoveryAssets(discoveryAssets.filter((asset) => !selectedDiscoveryAssets.includes(asset)));
      setFilteredDiscoveryAssets(filteredDiscoveryAssets.filter((asset) => !selectedDiscoveryAssets.includes(asset)));
      setSelectedDiscoveryAssets([]);
      setMessage(`${selectedDiscoveryAssets.length} assets added to Asset Registry`);
      setShowToast(true);
    } catch (error) {
      console.error('Error adding/updating assets:', error);
      setError('Error adding/updating assets');
      setShowToast(true);
    }
  };

  const handleIgnoreAssets = () => {
    const remainingDiscoveryAssets = discoveryAssets.filter((asset) => !selectedDiscoveryAssets.includes(asset));
    setDiscoveryAssets(remainingDiscoveryAssets);
    setFilteredDiscoveryAssets(remainingDiscoveryAssets);
    setMessage(`${selectedDiscoveryAssets.length} assets ignored`);
    setSelectedDiscoveryAssets([]);
    setShowToast(true);
  };

  const handleSelectAllDiscovery = () => {
    if (selectedDiscoveryAssets.length === filteredDiscoveryAssets.length) {
      setSelectedDiscoveryAssets([]);
    } else {
      setSelectedDiscoveryAssets(filteredDiscoveryAssets);
    }
  };

  const handleAddNewAsset = async () => {
    if (!newAsset.domain || !newAsset.type) {
      setError('Domain and Type are mandatory fields.');
      setShowToast(true);
      return;
    }

    try {
      await addOrUpdateAssets([newAsset]);
      const updatedAssets = await fetchAssets();
      setAssets(updatedAssets.data);
      setFilteredAssets(updatedAssets.data);
      setNewAsset({
        domain: '',
        type: '',
        ip: '',
        ports: '',
      });
      setMessage('Asset added successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error adding new asset:', error);
      setError('Error adding new asset');
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

  const handleDiscoveryFilterChange = (e, field) => {
    const value = e.target.value.toLowerCase();
    const newFilters = { ...discoveryFilters, [field]: value };
    setDiscoveryFilters(newFilters);
    const filtered = applyFilters(discoveryAssets, newFilters);
    setFilteredDiscoveryAssets(filtered);
  };

  return (
    <div>
      <Tabs defaultActiveKey="assets" id="uncontrolled-tab-example">
        <Tab eventKey="assets" title="Assets">
          <AssetList
            assets={filteredAssets}
            selectedAssets={selectedAssets}
            handleSelectAsset={handleSelectAsset}
            handleSelectAll={handleSelectAll}
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleDeleteAssets={handleDeleteAssets}
            handleEditAsset={handleEditAsset}
          />
        </Tab>
        <Tab eventKey="discovery" title="Auto Discovery">
          <AutoDiscovery
            domain={domain}
            setDomain={setDomain}
            handleAutoDiscovery={handleAutoDiscovery}
            loading={loading}
            setShowToast={setShowToast}
          />
          <DiscoveryResults
            discoveryAssets={filteredDiscoveryAssets}
            selectedDiscoveryAssets={selectedDiscoveryAssets}
            handleSelectDiscoveryAsset={handleSelectDiscoveryAsset}
            handleSelectAllDiscovery={handleSelectAllDiscovery}
            filters={discoveryFilters}
            handleDiscoveryFilterChange={handleDiscoveryFilterChange}
            handleAddToAssetRegistry={handleAddToAssetRegistry}
            handleIgnoreAssets={handleIgnoreAssets}
          />
        </Tab>
        <Tab eventKey="add" title="Add New (Manual)">
          <AddNewAsset
            newAsset={newAsset}
            setNewAsset={setNewAsset}
            handleAddNewAsset={handleAddNewAsset}
          />
        </Tab>
      </Tabs>
      <ToastNotification
        showToast={showToast}
        setShowToast={setShowToast}
        message={message}
        error={error}
      />
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
    </div>
  );
};

export default Assets;
