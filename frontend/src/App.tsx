import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import './styles/design-system.css';

// Placeholder pages
const Home = () => (
  <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
    <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Mine to the Bedrock.</h1>
    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
      Baserock is a gamified Proof-of-Work mining protocol on Base. Connect your wallet to start hashing.
    </p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
      <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Start Mining</button>
      <button className="btn btn-secondary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Read Docs</button>
    </div>
  </div>
);

const Mine = () => <div className="container" style={{ paddingTop: '80px' }}><h2>Mining Engine</h2></div>;
const Profile = () => <div className="container" style={{ paddingTop: '80px' }}><h2>Miner Profile</h2></div>;
const Leaderboard = () => <div className="container" style={{ paddingTop: '80px' }}><h2>Leaderboard</h2></div>;

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mine" element={<Mine />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
