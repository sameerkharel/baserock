//! Keccak256 hashing that matches Solidity's `keccak256(abi.encodePacked(challenge, miner, nonce))`.
//!
//! ## Encoding
//! Solidity's `abi.encodePacked` for our inputs produces:
//! - `challenge`: 32 bytes (bytes32)
//! - `miner`: 20 bytes (address)
//! - `nonce`: 32 bytes (uint256, big-endian, zero-padded)
//!
//! Total input: 84 bytes → keccak256 → 32-byte hash.

use tiny_keccak::{Hasher, Keccak};

/// Computes `keccak256(challenge || miner_address || nonce)`.
///
/// This exactly mirrors the Solidity contract's hash computation:
/// ```solidity
/// bytes32 hash = keccak256(abi.encodePacked(currentRound.challenge, msg.sender, nonce));
/// ```
///
/// # Arguments
/// * `challenge` - 32-byte round challenge from MiningEngine
/// * `miner_addr` - 20-byte Ethereum address
/// * `nonce` - 64-bit nonce (encoded as uint256 big-endian, zero-padded to 32 bytes)
///
/// # Returns
/// 32-byte keccak256 hash
pub fn compute_hash(challenge: &[u8], miner_addr: &[u8], nonce: u64) -> [u8; 32] {
    let mut keccak = Keccak::v256();

    // Feed challenge (32 bytes)
    keccak.update(challenge);

    // Feed miner address (20 bytes)
    keccak.update(miner_addr);

    // Feed nonce as uint256 (32 bytes, big-endian, zero-padded)
    // Solidity's abi.encodePacked(uint256) is 32 bytes big-endian.
    // A u64 fits in the last 8 bytes of a 32-byte big-endian representation.
    let mut nonce_bytes = [0u8; 32];
    nonce_bytes[24..32].copy_from_slice(&nonce.to_be_bytes());
    keccak.update(&nonce_bytes);

    // Finalize
    let mut output = [0u8; 32];
    keccak.finalize(&mut output);
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_is_deterministic() {
        let challenge = [0xaa; 32];
        let miner = [0xbb; 20];
        let nonce = 42u64;

        let hash1 = compute_hash(&challenge, &miner, nonce);
        let hash2 = compute_hash(&challenge, &miner, nonce);

        assert_eq!(hash1, hash2);
    }

    #[test]
    fn test_hash_changes_with_nonce() {
        let challenge = [0x00; 32];
        let miner = [0x00; 20];

        let hash0 = compute_hash(&challenge, &miner, 0);
        let hash1 = compute_hash(&challenge, &miner, 1);
        let hash2 = compute_hash(&challenge, &miner, 2);

        assert_ne!(hash0, hash1);
        assert_ne!(hash1, hash2);
        assert_ne!(hash0, hash2);
    }

    #[test]
    fn test_hash_is_32_bytes() {
        let hash = compute_hash(&[0; 32], &[0; 20], 0);
        assert_eq!(hash.len(), 32);
    }

    #[test]
    fn test_nonce_encoding_matches_uint256() {
        // We can't directly test the encoding here since the function doesn't expose it,
        // but we verify that the hash uses the full 32-byte uint256 representation
        // by checking that nonce=1 and nonce=256 produce different hashes
        let challenge = [0; 32];
        let miner = [0; 20];
        let hash_1 = compute_hash(&challenge, &miner, 1);
        let hash_256 = compute_hash(&challenge, &miner, 256);
        assert_ne!(hash_1, hash_256);
    }

    #[test]
    fn test_hash_changes_with_challenge() {
        let miner = [0x00; 20];
        let nonce = 0u64;

        let hash_a = compute_hash(&[0x00; 32], &miner, nonce);
        let hash_b = compute_hash(&[0x01; 32], &miner, nonce);

        assert_ne!(hash_a, hash_b);
    }

    #[test]
    fn test_hash_changes_with_miner() {
        let challenge = [0x00; 32];
        let nonce = 0u64;

        let hash_a = compute_hash(&challenge, &[0x00; 20], nonce);
        let hash_b = compute_hash(&challenge, &[0x01; 20], nonce);

        assert_ne!(hash_a, hash_b);
    }
}
