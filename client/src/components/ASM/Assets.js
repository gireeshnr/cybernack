import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaSearch, FaPlus, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { Modal, Button, Form, Spinner, Toast, Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
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
    const fetchAssets = async () => {
      try {
        const response = await axios.get('/api/assets');
        setAssets(response.data);
        setFilteredAssets(response.data);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Error fetching assets');
        setShowToast(true);
      }
    };

    fetchAssets();
  }, []);

  const handleAutoDiscovery = async () => {
    if (!domain) {
      setError('Domain or IP address is required for discovery.');
      setShowToast(true);
      return;
    }
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain) && !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(domain)) {
      setError('Invalid domain or IP address format.');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');
    setShowToast(false);

    try {
      const response = await axios.post('/api/assets/auto-discovery', { domain });
      const discoveredAssets = response.data.assets;
      const updatedDiscoveryAssets = discoveredAssets.map((asset) => {
        const existingAsset = assets.find((a) => a.domain === asset.domain);
        return {
          ...asset,
          status: existingAsset ? 'Existing' : 'New',
        };
      });
      setDiscoveryAssets(updatedDiscoveryAssets);
      setFilteredDiscoveryAssets(updatedDiscoveryAssets);
    } catch (error) {
      console.error('Error during auto discovery:', error);
      setError('Error during auto discovery');
      setShowToast(true);
    } finally {
      setLoading(false);
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
      await axios.post('/api/assets/delete', { assetIds: selectedAssets });
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
      const response = await axios.post('/api/assets/update', {
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

      await axios.post('/api/assets/add-or-update', { assets: [...newAssets, ...existingAssets] });

      const updatedAssets = await axios.get('/api/assets');
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
      await axios.post('/api/assets/add-or-update', { assets: [newAsset] });
      const updatedAssets = await axios.get('/api/assets');
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

  const applyFilters = (data, filters) => {
    return data.filter((item) =>
      Object.keys(filters).every((key) =>
        item[key].toString().toLowerCase().includes(filters[key].toLowerCase())
      )
    );
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

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Provide your domain in the below field and search for related domains. You can add or update assets after discovery.
    </Tooltip>
  );

  return (
    <div>
      <Tabs defaultActiveKey="assets" id="uncontrolled-tab-example">
        <Tab eventKey="assets" title="Assets">
          <div className="asset-list">
            <h3>Asset List</h3>
            <div className="sticky-action-icons">
              {selectedAssets.length > 0 && (
                <FaTrash onClick={handleDeleteAssets} style={{ cursor: 'pointer', color: 'red', marginBottom: '10px' }} />
              )}
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="sticky-header">
                      <input
                        type="checkbox"
                        checked={selectedAssets.length === filteredAssets.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="sticky-header">
                      Domain
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleFilterChange(e, 'domain')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">
                      Type
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleFilterChange(e, 'type')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">
                      IP Address
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleFilterChange(e, 'ip')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">
                      Ports
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleFilterChange(e, 'ports')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset._id)}
                          onChange={() => handleSelectAsset(asset._id)}
                        />
                      </td>
                      <td>{asset.domain}</td>
                      <td>{asset.type}</td>
                      <td>{asset.ip}</td>
                      <td>{asset.ports.join(', ')}</td>
                      <td>
                        <FaEdit onClick={() => handleEditAsset(asset)} style={{ cursor: 'pointer', color: 'blue' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tab>
        <Tab eventKey="discovery" title="Auto Discovery">
          <div className="auto-discovery" style={{ textAlign: 'left', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Auto Discover</span>
              <OverlayTrigger
                placement="right"
                overlay={renderTooltip}
              >
                <span>
                  <FaInfoCircle style={{ cursor: 'pointer', fontSize: '16px', color: '#007bff', marginLeft: '10px' }} />
                </span>
              </OverlayTrigger>
            </div>
            <div style={{ marginTop: '20px' }}>
              <Form>
                <Form.Group>
                  <Form.Label>Domain</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter primary domain"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setError('');
                      setShowToast(false);
                    }}
                  />
                </Form.Group>
                <Button onClick={handleAutoDiscovery} disabled={loading} style={{ marginTop: '10px' }}>
                  Discover
                </Button>
                {loading && <Spinner animation="border" role="status" style={{ marginLeft: '10px' }}><span className="sr-only">Discovering...</span></Spinner>}
              </Form>
            </div>
          </div>
          <div className="discovery-table" style={{ marginTop: '20px' }}>
            <h3>Discovery Results</h3>
            <div className="sticky-action-icons">
              <FaPlus
                onClick={handleAddToAssetRegistry}
                style={{ cursor: 'pointer', color: 'green', marginBottom: '10px', marginRight: '10px' }}
                title="Add selected assets to Asset Registry"
              />
              <FaTimes
                onClick={handleIgnoreAssets}
                style={{ cursor: 'pointer', color: 'red', marginBottom: '10px' }}
                title="Ignore selected assets"
              />
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="sticky-header">
                      <input
                        type="checkbox"
                        checked={selectedDiscoveryAssets.length === filteredDiscoveryAssets.length}
                        onChange={handleSelectAllDiscovery}
                      />
                    </th>
                    <th className="sticky-header">
                      Domain
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleDiscoveryFilterChange(e, 'domain')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">
                      Type
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleDiscoveryFilterChange(e, 'type')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">
                      IP Address
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleDiscoveryFilterChange(e, 'ip')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">
                      Ports
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleDiscoveryFilterChange(e, 'ports')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                    <th className="sticky-header">
                      Status
                      <input
                        type="text"
                        placeholder="Filter"
                        onChange={(e) => handleDiscoveryFilterChange(e, 'status')}
                        style={{ display: 'block', marginTop: '5px' }}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiscoveryAssets.map((asset) => (
                    <tr key={asset.domain}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedDiscoveryAssets.includes(asset)}
                          onChange={() => handleSelectDiscoveryAsset(asset)}
                        />
                      </td>
                      <td>{asset.domain}</td>
                      <td>{asset.type}</td>
                      <td>{asset.ip}</td>
                      <td>{asset.ports.join(', ')}</td>
                      <td>{asset.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tab>
        <Tab eventKey="add" title="Add New (Manual)">
          <div className="add-new-asset" style={{ textAlign: 'left', marginBottom: '20px' }}>
            <h3>Add New Asset</h3>
            <Form>
              <Form.Group>
                <Form.Label>Domain<span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter domain"
                  value={newAsset.domain}
                  onChange={(e) => setNewAsset({ ...newAsset, domain: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Type<span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter type"
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>IP Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter IP address"
                  value={newAsset.ip}
                  onChange={(e) => setNewAsset({ ...newAsset, ip: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Ports</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter ports (comma separated)"
                  value={newAsset.ports}
                  onChange={(e) => setNewAsset({ ...newAsset, ports: e.target.value })}
                />
              </Form.Group>
              <Button onClick={handleAddNewAsset} style={{ marginTop: '10px' }}>
                Add Asset
              </Button>
            </Form>
          </div>
        </Tab>
      </Tabs>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={4000}
        autohide
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          minWidth: '200px',
          backgroundColor: '#007bff',
          color: 'white',
        }}
      >
        <Toast.Body>{message || error}</Toast.Body>
      </Toast>

      {editAsset && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Asset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Domain</Form.Label>
                <Form.Control
                  type="text"
                  value={editAsset.domain}
                  onChange={(e) => setEditAsset({ ...editAsset, domain: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Control
                  type="text"
                  value={editAsset.type}
                  onChange={(e) => setEditAsset({ ...editAsset, type: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>IP Address</Form.Label>
                <Form.Control
                  type="text"
                  value={editAsset.ip}
                  onChange={(e) => setEditAsset({ ...editAsset, ip: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Ports</Form.Label>
                <Form.Control
                  type="text"
                  value={editAsset.ports.join(', ')}
                  onChange={(e) => setEditAsset({ ...editAsset, ports: e.target.value.split(',').map(Number) })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateAsset}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the selected assets?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteAssets}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Assets;
