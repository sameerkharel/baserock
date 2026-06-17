import React, { useEffect, useState } from 'react';
import { Shield, Activity } from 'lucide-react';

export const Footer = () => {
  const [blockHeight, setBlockHeight] = useState(14523980);

  useEffect(() => {
    // Simulate block height incrementing every ~2 seconds (like a fast rollup)
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={{
      borderTop: '1px dashed var(--text-muted)',
      padding: '16px 24px',
      marginTop: 'auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.8rem',
      fontFamily: 'var(--font-main)',
      color: 'var(--text-secondary)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>BASEROCK_PROTOCOL_V1.0.0</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Shield size={14} color="var(--text-muted)" />
          SECURE_ENCLAVE_ACTIVE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} color="var(--hacker-cyan)" />
          L2_BLOCK: <span style={{ color: 'var(--hacker-cyan)', fontWeight: 'bold' }}>{blockHeight.toLocaleString()}</span>
        </span>
        <span>|</span>
        <span>LATENCY: 12ms</span>
      </div>
    </footer>
  );
};
