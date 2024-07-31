import React from 'react';
import { FaTrash, FaEdit, FaSync } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './AssetList.css';

const AssetList = ({
  assets,
  selectedAssets,
  handleSelectAsset,
  handleSelectAll,
  handleFilterChange,
  handleDeleteAssets,
  handleEditAsset,
  handleRefresh
}) => {
  return (
    <div className="asset-list">
      <div className="sticky-action-icons">
        <FaSync
          onClick={handleRefresh}
          style={{ cursor: 'pointer', color: 'blue', marginBottom: '10px', marginRight: '10px', float: 'right' }}
          title="Refresh your asset list"
        />
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
              <th className="sticky-header">Domain</th>
              <th className="sticky-header">Type</th>
              <th className="sticky-header">IP Address</th>
              <th className="sticky-header">Ports</th>
              <th className="sticky-header">Protocol</th>
              <th className="sticky-header">Status</th>
              <th className="sticky-header">OS</th>
              <th className="sticky-header">Edit</th>
            </tr>
            <tr className="filter-row">
              <th className="sticky-filter"></th>
              <th className="sticky-filter" title="You can filter by keywords here">
                <input
                  type="text"
                  placeholder="Search Domain"
                  onChange={(e) => handleFilterChange(e, 'domain')}
                />
              </th>
              <th className="sticky-filter" title="You can filter by keywords here">
                <input
                  type="text"
                  placeholder="Search Type"
                  onChange={(e) => handleFilterChange(e, 'type')}
                />
              </th>
              <th className="sticky-filter" title="You can filter by keywords here">
                <input
                  type="text"
                  placeholder="Search IP Address"
                  onChange={(e) => handleFilterChange(e, 'ip')}
                />
              </th>
              <th className="sticky-filter" title="You can filter by keywords here">
                <input
                  type="text"
                  placeholder="Search Ports"
                  onChange={(e) => handleFilterChange(e, 'ports')}
                />
              </th>
              <th className="sticky-filter" title="You can filter by keywords here">
                <input
                  type="text"
                  placeholder="Search Protocol"
                  onChange={(e) => handleFilterChange(e, 'protocol')}
                />
              </th>
              <th className="sticky-filter" title="You can filter by keywords here">
                <input
                  type="text"
                  placeholder="Search Status"
                  onChange={(e) => handleFilterChange(e, 'status')}
                />
              </th>
              <th className="sticky-filter" title="You can filter by keywords here">
                <input
                  type="text"
                  placeholder="Search OS"
                  onChange={(e) => handleFilterChange(e, 'os')}
                />
              </th>
              <th className="sticky-filter"></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr
                key={asset._id}
                className={`${index % 2 === 0 ? 'even-row' : 'odd-row'} ${selectedAssets.includes(asset._id) ? 'selected' : ''}`}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset._id)}
                    onChange={() => handleSelectAsset(asset._id)}
                  />
                </td>
                <td><Link to={`/asm/assets/${asset._id}`}>{asset.domain}</Link></td>
                <td>{asset.type}</td>
                <td>{asset.ip}</td>
                <td>{asset.ports.map(port => port.portid).join(', ')}</td>
                <td>{asset.ports.map(port => port.protocol).join(', ')}</td>
                <td>{asset.status}</td>
                <td>{asset.os}</td>
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
