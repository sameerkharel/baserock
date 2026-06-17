import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Terminal, Cpu, Hexagon, Trophy, User } from 'lucide-react';

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/mine', label: 'MINING_RIG', icon: <Cpu size={16} strokeWidth={1.5} /> },
    { path: '/', label: 'SECTOR_MAP', icon: <Hexagon size={16} strokeWidth={1.5} /> },
    { path: '/economy', label: 'TREASURY', icon: <Terminal size={16} strokeWidth={1.5} /> },
    { path: '/leaderboard', label: 'SYS_RANK', icon: <Trophy size={16} strokeWidth={1.5} /> },
    { path: '/profile', label: 'USER_DATA', icon: <User size={16} strokeWidth={1.5} /> },
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
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Terminal size={24} color="var(--terminal-green)" strokeWidth={2} />
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '2px' }}>
            BASEROCK<span className="cursor-blink">_</span>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--terminal-green)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '4px 8px',
                  border: isActive ? '1px solid var(--terminal-green)' : '1px solid transparent',
                  background: isActive ? 'rgba(0, 255, 65, 0.05)' : 'transparent',
                  fontFamily: 'var(--font-display)'
                }}
              >
                {isActive && <span style={{ color: 'var(--terminal-green)' }}>&gt;</span>}
                {item.icon}
                <span className={isActive ? 'glitch-hover' : ''}>[{item.label}]</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--terminal-green)', padding: '6px 12px', background: 'var(--terminal-green-dim)' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--terminal-green)', boxShadow: '0 0 8px var(--terminal-green)', animation: 'opacity 2s infinite' }} className="cursor-blink" />
          <span style={{ fontSize: '0.75rem', color: 'var(--terminal-green)', fontWeight: 600, letterSpacing: '1px' }}>SYS_ONLINE</span>
        </div>
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
