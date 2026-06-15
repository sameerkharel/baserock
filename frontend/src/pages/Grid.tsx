import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Map, Flag, Pickaxe, Zap, Info, TrendingUp } from 'lucide-react';

// Terrain types
const TERRAIN_TYPES = {
  PLAINS: { name: 'Plains', multiplier: 1.0, color: '#4ade80', bgClass: 'bg-plains' },
  FOREST: { name: 'Dark Forest', multiplier: 1.2, color: '#16a34a', bgClass: 'bg-forest' },
  MOUNTAIN: { name: 'Mountains', multiplier: 1.5, color: '#94a3b8', bgClass: 'bg-mountain' },
  CAVERN: { name: 'Deep Caverns', multiplier: 2.0, color: '#8b5cf6', bgClass: 'bg-cavern' },
};

const GRID_SIZE = 50;

// Simple pseudo-random seeded generator for terrain
const seededRandom = (x: number, y: number) => {
  let seed = x * 10000 + y + 12345;
  const x0 = Math.sin(seed++) * 10000;
  return x0 - Math.floor(x0);
};

const getTerrain = (x: number, y: number) => {
  // Use a pseudo-Perlin noise approach (simplified)
  const val = (seededRandom(Math.floor(x/5), Math.floor(y/5)) * 0.5) 
            + (seededRandom(Math.floor(x/2), Math.floor(y/2)) * 0.3)
            + (seededRandom(x, y) * 0.2);
  
  if (val > 0.85) return TERRAIN_TYPES.CAVERN;
  if (val > 0.65) return TERRAIN_TYPES.MOUNTAIN;
  if (val > 0.4) return TERRAIN_TYPES.FOREST;
  return TERRAIN_TYPES.PLAINS;
};

export const Grid = () => {
  const { isConnected } = useAccount();
  const [selectedCell, setSelectedCell] = useState<{x: number, y: number} | null>(null);
  
  // Memoize the grid to prevent re-rendering 2500 divs on selection change
  const gridCells = useMemo(() => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const terrain = getTerrain(x, y);
        // Simulate some claimed cells randomly
        const isClaimed = seededRandom(y, x) > 0.95;
        const owner = isClaimed ? '0x...' + Math.floor(seededRandom(x,y)*1000).toString(16) : null;
        cells.push({ x, y, terrain, owner });
      }
    }
    return cells;
  }, []);

  const handleCellClick = (x: number, y: number) => {
    setSelectedCell({ x, y });
  };

  const selectedData = selectedCell 
    ? gridCells[selectedCell.y * GRID_SIZE + selectedCell.x] 
    : null;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', border: '1px solid var(--terminal-green)', background: 'var(--terminal-green-dim)' }}>
          <Map size={32} color="var(--terminal-green)" />
        </div>
        <div>
          <h1 className="glitch-hover" style={{ margin: 0, fontSize: '2rem' }}>SYS_SECTOR_MAP</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)' }}>&gt; GRID_COORD_SYSTEM ONLINE</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* The Grid Map */}
        <div className="glass-panel" style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px dashed var(--text-muted)', paddingBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--terminal-green)' }}>&gt; TOPOLOGY_VIEW</h3>
          </div>
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 24px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 24px)`,
              gap: '2px',
              padding: '16px',
              width: 'max-content'
            }}>
              {gridCells.map((cell) => {
                const isSelected = selectedCell?.x === cell.x && selectedCell?.y === cell.y;
                return (
                  <div 
                    key={`${cell.x}-${cell.y}`}
                    onClick={() => handleCellClick(cell.x, cell.y)}
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: cell.terrain.color,
                      opacity: cell.owner ? 0.9 : 0.4,
                      border: isSelected ? '2px solid white' : cell.owner ? '1px solid rgba(0,0,0,0.5)' : 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      zIndex: isSelected ? 10 : 1,
                      boxShadow: isSelected ? 'var(--terminal-green-glow)' : 'none',
                      transition: 'transform 0.1s'
                    }}
                    title={`SECTOR [${cell.x}, ${cell.y}] - ${cell.terrain.name.toUpperCase()}`}
                  >
                    {cell.owner && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Flag size={12} color="var(--bg-primary)" />
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Panel Area */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
          {selectedData ? (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Sector Context</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Coordinates:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>({selectedData.x}, {selectedData.y})</strong>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '16px', border: '1px dashed var(--text-muted)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>OWNER_ID</p>
                    {selectedData.owner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flag size={16} color="var(--alert-red)" />
                        <span style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>CLAIMED</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>UNCLAIMED_SECTOR</span>
                    )}
                  </div>
                </div>
              </div>

              {isConnected ? (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '16px' }}>
                  <Flag size={18} /> {selectedData.owner ? 'Challenge Control (50 MP)' : 'Claim Sector (10 MP)'}
                </button>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Connect wallet to claim territory
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
              <Map size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>&gt; AWAITING_SELECTION...</p>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Your Strategy Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total MP Earned:</span>
                <span style={{ fontWeight: 600 }}>0 MP</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '16px', border: '1px dashed var(--text-muted)', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>MULTIPLIER_MODIFIER</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color="var(--hacker-cyan)" />
                  <span style={{ fontWeight: 700, color: 'var(--hacker-cyan)' }}>+{selectedData ? Math.floor((selectedData.terrain.multiplier - 1) * 100) : 0}% BONUS</span>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <a href="/mine" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
                <Pickaxe size={18} /> Go to Mining Engine
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grid;
