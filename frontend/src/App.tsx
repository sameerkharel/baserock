import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Mine } from './pages/Mine';
import { Grid } from './pages/Grid';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { Economy } from './pages/Economy';
import './styles/design-system.css';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Grid />} />
            <Route path="/mine" element={<Mine />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/economy" element={<Economy />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
