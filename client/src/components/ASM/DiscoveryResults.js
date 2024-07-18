import React from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import './DiscoveryResults.css';

const DiscoveryResults = ({
  discoveryAssets = [], // Default to an empty array if not provided
  selectedDiscoveryAssets = [], // Ensure this also defaults to an empty array
  handleSelectDiscoveryAsset,
  handleSelectAllDiscovery,
  handleAddToAssetRegistry,
  handleIgnoreAssets
}) => {
  return (
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
                  checked={selectedDiscoveryAssets.length > 0 && selectedDiscoveryAssets.length === discoveryAssets.length}
                  onChange={handleSelectAllDiscovery}
                  disabled={discoveryAssets.length === 0} // Disable if no assets
                />
              </th>
              <th className="sticky-header">Domain</th>
              <th className="sticky-header">Type</th>
              <th className="sticky-header">IP Address</th>
              <th className="sticky-header">Ports</th>
              <th className="sticky-header">Status</th>
              <th className="sticky-header">Source</th>
            </tr>
          </thead>
          <tbody>
            {discoveryAssets.length > 0 ? (
              discoveryAssets.map((asset, index) => (
                <tr key={index}>
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
                  <td>{(asset.ports || []).join(', ')}</td>
                  <td>{asset.status}</td>
                  <td>{asset.source}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No discovery assets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiscoveryResults;
