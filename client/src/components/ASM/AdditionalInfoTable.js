import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const AdditionalInfoTable = ({ asset }) => {
  return (
    <TableContainer component={Paper} className="additional-info-table">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Field</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>TCP Sequence</TableCell>
            <TableCell>{asset.tcpSequence}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>IP ID Sequence</TableCell>
            <TableCell>{asset.ipIdSequence}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>TCP Timestamp Sequence</TableCell>
            <TableCell>{asset.tcpTimestampSeq}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>SRTT</TableCell>
            <TableCell>{asset.srtt}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>RTT Variance</TableCell>
            <TableCell>{asset.rttVariance}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Timeout</TableCell>
            <TableCell>{asset.timeout}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Distance</TableCell>
            <TableCell>{asset.distance}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Traceroute</TableCell>
            <TableCell>
              <pre>{JSON.stringify(asset.traceroute, null, 2)}</pre>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdditionalInfoTable;