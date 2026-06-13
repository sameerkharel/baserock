import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Mine } from './pages/Mine';
import { Grid } from './pages/Grid';
import './styles/design-system.css';

const Profile = () => <div className="container" style={{ paddingTop: '80px' }}><h2>Miner Profile</h2></div>;
const Leaderboard = () => <div className="container" style={{ paddingTop: '80px' }}><h2>Leaderboard</h2></div>;

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
