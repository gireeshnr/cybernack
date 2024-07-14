import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import './AssetList.css';

const AssetList = ({ assets, selectedAssets, handleSelectAsset, handleSelectAll, filters, handleFilterChange, handleDeleteAssets, handleEditAsset }) => {
  return (
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
                  checked={selectedAssets.length === assets.length}
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
            {assets.map((asset) => (
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
  );
};

export default AssetList;
