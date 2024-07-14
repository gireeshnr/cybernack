import React from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import './DiscoveryResults.css';

const DiscoveryResults = ({ discoveryAssets, selectedDiscoveryAssets, handleSelectDiscoveryAsset, handleSelectAllDiscovery, filters, handleDiscoveryFilterChange, handleAddToAssetRegistry, handleIgnoreAssets }) => {
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
                  checked={selectedDiscoveryAssets.length === discoveryAssets.length}
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
            {discoveryAssets.map((asset) => (
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
  );
};

export default DiscoveryResults;
