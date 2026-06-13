//! # Baserock Mining Engine (WASM)
//!
//! Browser-based keccak256 Proof-of-Work mining engine.
//! Compiled to WebAssembly and runs inside a Web Worker for non-blocking mining.
//!
//! ## How It Works
//! The on-chain `MiningEngine.sol` generates a challenge per round:
//!   `challenge = keccak256(roundId, prevrandao, timestamp)`
//!
//! A valid proof is a nonce where:
//!   `uint256(keccak256(challenge, minerAddress, nonce)) <= difficulty`
//!
//! This WASM module performs the nonce search loop at near-native speed.

mod hasher;

use wasm_bindgen::prelude::*;
use serde::Serialize;

/// Result returned when a valid proof is found.
#[derive(Serialize)]
pub struct MiningResult {
    /// The nonce that solves the challenge.
    pub nonce: u64,
    /// The resulting hash as a hex string.
    pub hash: String,
    /// Number of hashes computed to find this proof.
    pub iterations: u64,
}

/// Result returned from the benchmark function.
#[derive(Serialize)]
pub struct BenchmarkResult {
    /// Total hashes computed during the benchmark.
    pub hashes: u64,
    /// Duration of benchmark in milliseconds.
    pub duration_ms: f64,
    /// Computed hash rate (hashes per second).
    pub hash_rate: f64,
}

/// Mines for a valid proof-of-work nonce.
///
/// # Arguments
/// * `challenge` - 32-byte challenge from the MiningEngine contract
/// * `miner_addr` - 20-byte miner address (msg.sender)
/// * `difficulty` - 32-byte difficulty target (hash must be <= this value)
/// * `start_nonce` - Nonce to start searching from
/// * `max_iterations` - Maximum number of hashes to compute before returning
///
/// # Returns
/// A `JsValue` containing either a `MiningResult` (if found) or `null`.
#[wasm_bindgen]
pub fn mine(
    challenge: &[u8],
    miner_addr: &[u8],
    difficulty: &[u8],
    start_nonce: u64,
    max_iterations: u64,
) -> JsValue {
    if challenge.len() != 32 || miner_addr.len() != 20 || difficulty.len() != 32 {
        return JsValue::NULL;
    }

    let difficulty_bytes: [u8; 32] = difficulty.try_into().unwrap();

    for i in 0..max_iterations {
        let nonce = start_nonce.wrapping_add(i);
        let hash = hasher::compute_hash(challenge, miner_addr, nonce);

        if is_valid_proof(&hash, &difficulty_bytes) {
            let result = MiningResult {
                nonce,
                hash: hex_encode(&hash),
                iterations: i + 1,
            };
            return serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL);
        }
    }

    // No valid proof found within max_iterations
    JsValue::NULL
}

/// Verifies that a given nonce produces a valid proof for the challenge.
///
/// # Arguments
/// * `challenge` - 32-byte challenge
/// * `miner_addr` - 20-byte miner address
/// * `nonce` - The nonce to verify
/// * `difficulty` - 32-byte difficulty target
///
/// # Returns
/// `true` if the proof is valid.
#[wasm_bindgen]
pub fn verify_proof(
    challenge: &[u8],
    miner_addr: &[u8],
    nonce: u64,
    difficulty: &[u8],
) -> bool {
    if challenge.len() != 32 || miner_addr.len() != 20 || difficulty.len() != 32 {
        return false;
    }

    let hash = hasher::compute_hash(challenge, miner_addr, nonce);
    let difficulty_bytes: [u8; 32] = difficulty.try_into().unwrap();
    is_valid_proof(&hash, &difficulty_bytes)
}

/// Runs a hash rate benchmark for the specified duration.
///
/// # Arguments
/// * `duration_ms` - How long to run the benchmark (in milliseconds)
///
/// # Returns
/// A `JsValue` containing a `BenchmarkResult` with hash rate info.
#[wasm_bindgen]
pub fn benchmark(duration_ms: f64) -> JsValue {
    let start = js_sys::Date::now();
    let mut hashes: u64 = 0;
    let challenge = [0u8; 32];
    let miner = [0u8; 20];

    loop {
        let elapsed = js_sys::Date::now() - start;
        if elapsed >= duration_ms {
            let result = BenchmarkResult {
                hashes,
                duration_ms: elapsed,
                hash_rate: (hashes as f64 / elapsed) * 1000.0,
            };
            return serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL);
        }

        // Run a batch of 1000 hashes before checking the clock
        // (Date::now() calls have overhead, so we amortize it)
        for j in 0..1000u64 {
            hasher::compute_hash(&challenge, &miner, hashes + j);
        }
        hashes += 1000;
    }
}

/// Returns the hash of a specific (challenge, miner, nonce) triplet as a hex string.
/// Useful for debugging and display.
#[wasm_bindgen]
pub fn compute_hash_hex(challenge: &[u8], miner_addr: &[u8], nonce: u64) -> String {
    let hash = hasher::compute_hash(challenge, miner_addr, nonce);
    hex_encode(&hash)
}

/// Checks if hash <= difficulty (big-endian comparison).
fn is_valid_proof(hash: &[u8; 32], difficulty: &[u8; 32]) -> bool {
    // Compare byte-by-byte from most significant to least significant
    for i in 0..32 {
        if hash[i] < difficulty[i] {
            return true;
        }
        if hash[i] > difficulty[i] {
            return false;
        }
    }
    true // hash == difficulty
}

/// Encode bytes to hex string.
fn hex_encode(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2 + 2);
    s.push_str("0x");
    for b in bytes {
        s.push_str(&format!("{:02x}", b));
    }
    s
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_encode() {
        let bytes = [0xde, 0xad, 0xbe, 0xef];
        assert_eq!(hex_encode(&bytes), "0xdeadbeef");
    }

    #[test]
    fn test_is_valid_proof_less() {
        let hash = [0x00; 32];
        let difficulty = [0xff; 32];
        assert!(is_valid_proof(&hash, &difficulty));
    }

    #[test]
    fn test_is_valid_proof_equal() {
        let hash = [0xab; 32];
        let difficulty = [0xab; 32];
        assert!(is_valid_proof(&hash, &difficulty));
    }

    #[test]
    fn test_is_valid_proof_greater() {
        let hash = [0xff; 32];
        let difficulty = [0x00; 32];
        assert!(!is_valid_proof(&hash, &difficulty));
    }

    #[test]
    fn test_verify_proof_with_max_difficulty() {
        // With max difficulty, any nonce should be valid
        let challenge = [0u8; 32];
        let miner = [0u8; 20];
        let difficulty = [0xff; 32];
        assert!(verify_proof(&challenge, &miner, 0, &difficulty));
        assert!(verify_proof(&challenge, &miner, 12345, &difficulty));
    }

    #[test]
    fn test_verify_proof_with_zero_difficulty() {
        // With zero difficulty, almost no nonce should be valid
        // (only if keccak256 happens to produce all zeros, which is essentially impossible)
        let challenge = [0u8; 32];
        let miner = [0u8; 20];
        let difficulty = [0x00; 32];
        // It's astronomically unlikely for keccak256 to produce all zeros
        assert!(!verify_proof(&challenge, &miner, 0, &difficulty));
    }

    #[test]
    fn test_verify_rejects_bad_input_lengths() {
        let challenge = [0u8; 31]; // wrong length
        let miner = [0u8; 20];
        let difficulty = [0xff; 32];
        assert!(!verify_proof(&challenge, &miner, 0, &difficulty));
    }

    #[test]
    fn test_different_miners_different_hashes() {
        let challenge = [0u8; 32];
        let miner_a = [0x01; 20];
        let miner_b = [0x02; 20];
        let hash_a = hasher::compute_hash(&challenge, &miner_a, 0);
        let hash_b = hasher::compute_hash(&challenge, &miner_b, 0);
        assert_ne!(hash_a, hash_b);
    }

    #[test]
    fn test_different_nonces_different_hashes() {
        let challenge = [0u8; 32];
        let miner = [0u8; 20];
        let hash_a = hasher::compute_hash(&challenge, &miner, 0);
        let hash_b = hasher::compute_hash(&challenge, &miner, 1);
        assert_ne!(hash_a, hash_b);
    }
}
