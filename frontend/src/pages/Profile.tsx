import React from 'react';
import { useAccount } from 'wagmi';
import { User, Shield, Award, Zap, Activity, Users } from 'lucide-react';

export const Profile = () => {
  const { address, isConnected } = useAccount();

  // Mock progression data for UI demonstration
  const minerStats = {
    level: 12,
    title: 'Journeyman Excavator',
    xp: 4500,
    nextLevelXp: 5000,
    totalMp: 1250,
    sectorsControlled: 8,
    hashesComputed: '124.5M',
    guild: 'The Iron Pickaxes',
  };

  const progressPercentage = (minerStats.xp / minerStats.nextLevelXp) * 100;

  if (!isConnected) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
          <User size={64} color="var(--text-muted)" style={{ marginBottom: '24px' }} />
          <h2>Connect Your Wallet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You must be connected to view your miner profile and progression.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
          <User size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Miner Profile</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Track your progression, stats, and guild affiliation.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Identity & Level */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{minerStats.level}</span>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {minerStats.title} <Shield size={20} color="var(--accent-secondary)" />
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </p>
                </div>
                {minerStats.guild && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.85rem' }}>
                    <Users size={14} color="var(--accent-tertiary)" />
                    <span>{minerStats.guild}</span>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Level Progression</span>
                  <span>{minerStats.xp} / {minerStats.nextLevelXp} XP</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: \`\${progressPercentage}%\`, 
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                    boxShadow: '0 0 10px var(--accent-primary)'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <StatCard icon={<Zap size={24} color="#eab308" />} title="Total MP" value={minerStats.totalMp} subtitle="Mining Power" />
            <StatCard icon={<Award size={24} color="#3b82f6" />} title="Sectors" value={minerStats.sectorsControlled} subtitle="Currently Controlled" />
            <StatCard icon={<Activity size={24} color="#ec4899" />} title="Hashes" value={minerStats.hashesComputed} subtitle="Lifetime Computed" />
          </div>
        </div>

        {/* Sidebar / Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              Recent Badges
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Badge title="First Blood" desc="Submitted your first valid proof" />
              <Badge title="Land Grabber" desc="Claimed 5 grid sectors" />
              <Badge title="Hashing Machine" desc="Computed 100M hashes" />
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Guild Hub</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
              Combine your MP with other miners to conquer high-tier territories.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%' }}>Manage Guild</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle }: any) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <div style={{ marginBottom: '12px' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{subtitle}</div>
  </div>
);

const Badge = ({ title, desc }: any) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Award size={16} color="var(--accent-secondary)" />
    </div>
    <div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>{desc}</div>
    </div>
  </div>
);

export default Profile;
