import * as wasm from 'baserock-mining-engine';

// The worker keeps track of whether it should keep mining
let isMining = false;
let hashCount = 0;
let lastReportTime = 0;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === 'START_MINING') {
    if (isMining) return;
    isMining = true;
    
    const { challenge, minerAddress, difficulty, startNonce } = payload;
    
    // Convert hex strings to Uint8Arrays for the WASM module
    const challengeBytes = hexToBytes(challenge);
    const minerBytes = hexToBytes(minerAddress);
    const difficultyBytes = hexToBytes(difficulty);
    
    let currentNonce = startNonce;
    hashCount = 0;
    lastReportTime = performance.now();
    
    const miningLoop = () => {
      if (!isMining) return;
      
      // Mine in chunks of 5000 iterations to avoid blocking the worker entirely
      // and allow it to receive the STOP_MINING message
      const BATCH_SIZE = 5000n;
      
      const result = wasm.mine(
        challengeBytes, 
        minerBytes, 
        difficultyBytes, 
        currentNonce, 
        BATCH_SIZE
      );
      
      hashCount += Number(BATCH_SIZE);
      currentNonce += BATCH_SIZE;
      
      const now = performance.now();
      if (now - lastReportTime > 1000) {
        // Report hash rate every second
        const hashRate = hashCount / ((now - lastReportTime) / 1000);
        self.postMessage({ type: 'HASH_RATE', payload: { hashRate } });
        hashCount = 0;
        lastReportTime = now;
      }
      
      if (result) {
        // Valid proof found!
        isMining = false;
        self.postMessage({ 
          type: 'PROOF_FOUND', 
          payload: { 
            nonce: result.nonce.toString(), 
            hash: result.hash 
          } 
        });
      } else {
        // Continue mining next batch
        setTimeout(miningLoop, 0);
      }
    };
    
    // Start the loop
    miningLoop();
    
  } else if (type === 'STOP_MINING') {
    isMining = false;
    self.postMessage({ type: 'MINING_STOPPED' });
  }
};

function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith('0x')) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
