import React from 'react';
import './ThreatIntelResults.css';
import { FaShieldAlt, FaBug, FaNetworkWired } from 'react-icons/fa';

const ThreatIntelResults = ({ threatIntelData }) => {
  const renderRapidDNS = (data) => {
    if (!data || !data.Question || !data.Answer) {
      return <p>No RapidDNS data available.</p>;
    }
    const question = data.Question[0];
    const answer = data.Answer[0];
    return (
      <div className="card rapid-dns-card">
        <div className="card-header">
          <FaShieldAlt className="card-icon" />
          <h4>Domain Reputation</h4>
        </div>
        <div className="card-body">
          {data.Answer.length > 0 ? (
            <p>
              The domain <strong>{question.name}</strong> resolves to the IP address <strong>{answer.data}</strong>.<br />
              TTL: <strong>{answer.TTL}</strong> seconds.
            </p>
          ) : (
            <p>We checked the IP reputation and found it to be clean.</p>
          )}
        </div>
      </div>
    );
  };

  const renderVirusTotal = (data) => {
    if (!data || !data.last_analysis_results || !data.last_analysis_stats) {
      return <p>No VirusTotal data available.</p>;
    }
    const analysisResults = data.last_analysis_results;
    const maliciousFindings = data.last_analysis_stats.malicious > 0 || data.last_analysis_stats.suspicious > 0;

    return (
      <div className={`card virus-total-card ${maliciousFindings ? 'card-danger' : 'card-success'}`}>
        <div className="card-header">
          <FaBug className="card-icon" />
          <h4>Threat Analysis</h4>
        </div>
        <div className="card-body">
          {maliciousFindings ? (
            <p>We found suspicious or malicious findings in VirusTotal analysis:</p>
          ) : (
            <p>No suspicious findings in VirusTotal analysis.</p>
          )}
          <div className="analysis-results">
            {analysisResults && Object.keys(analysisResults).map((key) => (
              <div key={key} className="analysis-result">
                <strong>{analysisResults[key].engine_name}</strong>: {analysisResults[key].result} ({analysisResults[key].category})
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGreyNoise = (data) => {
    if (!data) {
      return <p>No GreyNoise data available.</p>;
    }
    return (
      <div className={`card grey-noise-card ${data.noise ? 'card-danger' : 'card-success'}`}>
        <div className="card-header">
          <FaNetworkWired className="card-icon" />
          <h4>Network Traffic Analysis</h4>
        </div>
        <div className="card-body">
          {data.noise ? (
            <p>We analyzed the network traffic associated with the IP <strong>{data.ip}</strong> and detected potential indicators of suspicious traffic. Further investigation is recommended.</p>
          ) : (
            <p>We analyzed the network traffic associated with the IP <strong>{data.ip}</strong> and found no malicious activity.</p>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (item) => {
    if (!item || !item.source || !item.data) {
      return null;
    }
    switch (item.source) {
      case 'RapidDNS':
        return renderRapidDNS(item.data);
      case 'VirusTotal':
        return renderVirusTotal(item.data);
      case 'GreyNoise':
        return renderGreyNoise(item.data);
      default:
        return null;
    }
  };

  if (!threatIntelData || !Array.isArray(threatIntelData)) {
    return <p>No threat intelligence data available.</p>;
  }

  return (
    <div className="threat-intel-results">
      {threatIntelData.map((item, index) => (
        <div key={index} className="threat-intel-section">
          {renderSection(item)}
        </div>
      ))}
    </div>
  );
};

export default ThreatIntelResults;
