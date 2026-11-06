import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import '@livekit/components-styles';
import './styles.css';
import { Lobby } from './pages/Lobby';
import { Room } from './pages/Room';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/r/:room" element={<Room />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
