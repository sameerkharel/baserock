import React, { useEffect, useState, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { miningEngineABI } from '../config/abi';
import { Square, Cpu, Zap, Hash, Activity } from 'lucide-react';
import Worker from '../workers/mining.worker?worker';

// Replace with deployed address on Base Sepolia
const MINING_ENGINE_ADDRESS = '0x0000000000000000000000000000000000000000';

export const Mine = () => {
  const { address, isConnected } = useAccount();
  const workerRef = useRef<Worker | null>(null);
  
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [foundNonce, setFoundNonce] = useState<string | null>(null);
  
  // Read current Round ID
  const { data: roundId, refetch: refetchRoundId } = useReadContract({
    address: MINING_ENGINE_ADDRESS,
    abi: miningEngineABI,
    functionName: 'currentRoundId',
  });
  
  // Read Round details
  const { data: roundData, refetch: refetchRoundData } = useReadContract({
    address: MINING_ENGINE_ADDRESS,
    abi: miningEngineABI,
    functionName: 'rounds',
    args: roundId ? [roundId] : undefined,
    query: { enabled: !!roundId },
  });
  
  // Write contract for submitting proof
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker();
    
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'HASH_RATE') {
        setHashRate(payload.hashRate);
      } else if (type === 'PROOF_FOUND') {
        setIsMining(false);
        setHashRate(0);
        setFoundNonce(payload.nonce);
      } else if (type === 'MINING_STOPPED') {
        setIsMining(false);
        setHashRate(0);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleStartMining = () => {
    if (!address || !roundData) return;
    
    const [startTime, challenge, difficulty, totalProofs, isEnded] = roundData;
    
    if (isEnded) {
      alert("Current round is ended. Please wait for the next round.");
      return;
    }
    
    setIsMining(true);
    setFoundNonce(null);
    
    // Start mining with random nonce
    const startNonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    
    // Pass everything as hex strings
    workerRef.current?.postMessage({
      type: 'START_MINING',
      payload: {
        challenge: challenge,
        minerAddress: address,
        difficulty: difficulty.toString(16).padStart(64, '0'), // uint256 to hex
        startNonce: startNonce
      }
    });
  };

  const handleStopMining = () => {
    workerRef.current?.postMessage({ type: 'STOP_MINING' });
  };
  
  const handleSubmitProof = () => {
    if (!foundNonce) return;
    writeContract({
      address: MINING_ENGINE_ADDRESS,
      abi: miningEngineABI,
      functionName: 'submitProof',
      args: [BigInt(foundNonce)],
    });
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', border: '1px solid var(--terminal-green)', background: 'var(--terminal-green-dim)' }}>
          <Cpu size={32} color="var(--terminal-green)" />
        </div>
        <div>
          <h1 className="glitch-hover" style={{ margin: 0, fontSize: '2rem' }}>SYS_MINING_RIG</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)' }}>&gt; EXECUTE_PROOF_OF_WORK --TARGET=BASE_SEPOLIA</p>
        </div>
      </div>
      
      {!isConnected ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', border: '1px dashed var(--alert-red)' }}>
          <h2 style={{ color: 'var(--alert-red)' }}>ERR_NO_CONNECTION</h2>
          <h2 style={{ color: 'var(--alert-red)' }}>ERR_NO_CONNECTION</h2>
          <p style={{ color: 'var(--text-secondary)' }}>&gt; AWAITING_WEB3_PROVIDER...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Mining Controls */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: '1px dashed var(--text-muted)', paddingBottom: '16px', color: 'var(--terminal-green)' }}>
              &gt; RIG_CONTROLS
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
              <div style={{ 
                width: '180px', height: '180px', 
                background: isMining ? 'var(--terminal-green-dim)' : 'transparent',
                border: isMining ? '2px solid var(--terminal-green)' : '1px dashed var(--text-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: isMining ? 'var(--terminal-green-glow)' : 'none',
                transition: 'all 0.1s'
              }}>
                <Activity size={48} color={isMining ? 'var(--terminal-green)' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '2rem', fontWeight: 800, color: isMining ? 'var(--terminal-green)' : 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>
                  {isMining ? (hashRate / 1000).toFixed(1) : '0.0'}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>KH/S</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {!isMining ? (
                <button className="btn btn-primary" onClick={handleStartMining} style={{ flex: 1 }}>
                  [ INIT_HASHING_SEQUENCE ]
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={handleStopMining} style={{ flex: 1, borderColor: 'var(--alert-red)', color: 'var(--alert-red)' }}>
                  <Square size={16} /> [ HALT_PROCESS ]
                </button>
              )}
            </div>
            
            {foundNonce && (
              <div style={{ padding: '16px', background: 'rgba(0, 255, 255, 0.1)', border: '1px solid var(--hacker-cyan)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', color: 'var(--hacker-cyan)', fontWeight: 600 }}>&gt; VALID_NONCE_LOCATED</p>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmitProof} 
                  disabled={isPending || isConfirming}
                  style={{ width: '100%', background: 'var(--hacker-cyan)', color: '#000', borderColor: 'var(--hacker-cyan)' }}
                >
                  {isPending ? 'AWAITING_SIG...' : isConfirming ? 'TX_BROADCASTING...' : '[ SUBMIT_PAYLOAD ]'}
                </button>
                {isConfirmed && <p style={{ margin: '8px 0 0 0', color: 'var(--hacker-cyan)', fontSize: '0.9rem' }}>&gt; TX_CONFIRMED. MP_INCREMENTED.</p>}
              </div>
            )}
          </div>
          
          {/* Network Stats */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: '1px dashed var(--text-muted)', paddingBottom: '16px', color: 'var(--terminal-green)' }}>
              &gt; NETWORK_TELEMETRY
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <StatBox 
                icon={<Hash size={20} />} 
                label="ROUND_ID" 
                value={roundId ? roundId.toString() : '...'} 
              />
              <StatBox 
                icon={<Activity size={20} />} 
                label="PROOFS_SUBMITTED" 
                value={roundData ? roundData[3].toString() : '...'} 
                suffix="/ 100"
              />
              <StatBox 
                icon={<Zap size={20} />} 
                label="DIFF_TARGET" 
                value={roundData ? roundData[2].toString().substring(0, 10) + '...' : '...'} 
                small
              />
            </div>
            
            <div style={{ marginTop: 'auto', padding: '16px', border: '1px solid var(--text-muted)', background: 'var(--bg-primary)' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: 'var(--font-main)' }}>
                <span style={{ color: 'var(--terminal-green)' }}>[INFO]</span> Your node computes keccak256 hashes locally via WebAssembly. Submitting a valid nonce grants MP (Mining Power).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, label, value, suffix = '', small = false }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '16px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
    <div style={{ width: '40px', height: '40px', border: '1px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', color: 'var(--terminal-green)' }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      <p style={{ margin: '4px 0 0 0', fontSize: small ? '1rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-main)' }}>
        {value} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{suffix}</span>
      </p>
    </div>
  </div>
);

export default Mine;
