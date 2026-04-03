import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PreSchoolPage from './pages/PreSchoolPage';
import LowerPrimaryPage from './pages/LowerPrimaryPage';
import HigherPrimaryPage from './pages/HigherPrimaryPage';
import Game from './game/Game';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/preschool" element={<PreSchoolPage />} />
        <Route path="/lower-primary" element={<LowerPrimaryPage />} />
        <Route path="/higher-primary" element={<HigherPrimaryPage />} />
        <Route path="/play" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}
