import React, { useEffect, useState, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { miningEngineABI } from '../config/abi';
import { Play, Square, Pickaxe, Zap, Hash } from 'lucide-react';
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
        <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
          <Pickaxe size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Mining Engine</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Solve PoW challenges to earn MP and rewards.</p>
        </div>
      </div>
      
      {!isConnected ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <h2>Wallet not connected</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please connect your wallet to view mining stats and start mining.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Mining Controls */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
              Rig Controls
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
              <div style={{ 
                width: '180px', height: '180px', borderRadius: '50%', 
                background: isMining ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                border: \`4px solid \${isMining ? 'var(--accent-primary)' : 'var(--glass-border)'}\`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: isMining ? '0 0 40px rgba(99, 102, 241, 0.4)' : 'none',
                transition: 'all 0.3s ease',
                animation: isMining ? 'pulse-glow 2s infinite' : 'none'
              }}>
                <Zap size={48} color={isMining ? 'var(--accent-primary)' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '2rem', fontWeight: 800, color: isMining ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {isMining ? (hashRate / 1000).toFixed(1) : '0.0'}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>KH/s</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {!isMining ? (
                <button className="btn btn-primary" onClick={handleStartMining} style={{ flex: 1, padding: '16px' }}>
                  <Play size={20} /> Start Mining
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={handleStopMining} style={{ flex: 1, padding: '16px', border: '1px solid #ef4444', color: '#ef4444' }}>
                  <Square size={20} /> Stop Rig
                </button>
              )}
            </div>
            
            {foundNonce && (
              <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', color: '#4ade80', fontWeight: 600 }}>Proof Found! 🚀</p>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmitProof} 
                  disabled={isPending || isConfirming}
                  style={{ width: '100%', background: '#22c55e' }}
                >
                  {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Confirming Tx...' : 'Submit Proof on Base'}
                </button>
                {isConfirmed && <p style={{ margin: '8px 0 0 0', color: '#4ade80', fontSize: '0.9rem' }}>Proof submitted successfully!</p>}
              </div>
            )}
          </div>
          
          {/* Network Stats */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
              Network State
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <StatBox 
                icon={<Hash size={20} />} 
                label="Current Round ID" 
                value={roundId ? roundId.toString() : '...'} 
              />
              <StatBox 
                icon={<Pickaxe size={20} />} 
                label="Proofs Submitted" 
                value={roundData ? roundData[3].toString() : '...'} 
                suffix="/ 100 target"
              />
              <StatBox 
                icon={<Zap size={20} />} 
                label="Difficulty Target" 
                value={roundData ? roundData[2].toString().substring(0, 8) + '...' : '...'} 
                small
              />
            </div>
            
            <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>How it works:</strong> Your browser computes thousands of keccak256 hashes per second using WebAssembly. 
                When a hash is found that is lower than the network difficulty target, you can submit it to the smart contract 
                to increase your Mining Power (MP).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, label, value, suffix = '', small = false }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', color: 'var(--text-secondary)' }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      <p style={{ margin: '4px 0 0 0', fontSize: small ? '1.2rem' : '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: small ? 'var(--font-mono)' : 'inherit' }}>
        {value} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{suffix}</span>
      </p>
    </div>
  </div>
);

export default Mine;
