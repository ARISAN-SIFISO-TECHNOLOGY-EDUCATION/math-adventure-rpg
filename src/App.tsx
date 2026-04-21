import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import CurriculumPage from './pages/CurriculumPage';
import ParentsPage from './pages/ParentsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';
import PreSchoolPage from './pages/PreSchoolPage';
import LowerPrimaryPage from './pages/LowerPrimaryPage';
import HigherPrimaryPage from './pages/HigherPrimaryPage';
import AdvancedPrimaryPage from './pages/AdvancedPrimaryPage';
import Game from './game/Game';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/parents" element={<ParentsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/preschool" element={<PreSchoolPage />} />
        <Route path="/lower-primary" element={<LowerPrimaryPage />} />
        <Route path="/higher-primary" element={<HigherPrimaryPage />} />
        <Route path="/advanced-primary" element={<AdvancedPrimaryPage />} />
        <Route path="/play" element={<Game />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
