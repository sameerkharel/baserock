import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Pickaxe, LayoutDashboard, Trophy, User } from 'lucide-react';

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/mine', label: 'Mining Engine', icon: <Pickaxe size={18} /> },
    { path: '/', label: 'Grid', icon: <LayoutDashboard size={18} /> }, // Placeholder for step 5
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    { path: '/profile', label: 'Profile', icon: <User size={18} /> },
  ];

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      margin: '16px 24px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-tertiary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
          }}>B</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            BASEROCK
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  fontSize: '0.95rem'
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <ConnectButton 
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
      </div>
    </header>
  );
};
