import { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
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
import SecondaryPage from './pages/SecondaryPage';
import Age14Page from './pages/Age14Page';
import Age15Page from './pages/Age15Page';
import Age16Page from './pages/Age16Page';
import Age17Page from './pages/Age17Page';
import GrownUpCorner from './pages/GrownUpCorner';
import Game from './game/Game';
// Senior Exam Studio (ages 15–17) is lazy-loaded: its large IGCSE engine only
// ships to players who actually open ages 15–17, keeping the kids' start fast.
const SeniorTopicsPage = lazy(() => import('./senior/pages/TopicsPage'));
const SeniorActivityPage = lazy(() => import('./senior/pages/ActivityPage'));
const SeniorSuccessPage = lazy(() => import('./senior/pages/SuccessPage'));
const SeniorMistakeBookPage = lazy(() => import('./senior/pages/MistakeBookPage'));
import BottomNav from './components/BottomNav';
import { consumeScreenBack } from './lib/backHandler';

// Single source of truth for the Android hardware Back button AND the edge-swipe
// back gesture (both fire Capacitor's `backButton` event once a listener is
// registered). Order of resolution on each press:
//   1. Let the active screen pop its own in-page UI (e.g. the Game's overlays).
//   2. Otherwise step back through the router history (idx > 0).
//   3. Otherwise jump to home.
//   4. At home with no history → leave the app.
// No-op in a plain browser (the dynamic import simply fails outside Capacitor).
function AndroidBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const locRef = useRef(location);
  locRef.current = location;

  useEffect(() => {
    let remove: (() => void) | undefined;
    import('@capacitor/app')
      .then(({ App: CapApp }) =>
        CapApp.addListener('backButton', () => {
          if (consumeScreenBack()) return;
          const idx = (window.history.state?.idx as number | undefined) ?? 0;
          if (idx > 0) { navigate(-1); return; }
          if (locRef.current.pathname !== '/') { navigate('/'); return; }
          CapApp.exitApp();
        }).then(handle => { remove = () => handle.remove(); })
      )
      .catch(() => { /* not running inside Capacitor */ });
    return () => remove?.();
  }, [navigate]);

  return null;
}

function AppShell() {
  const { pathname } = useLocation();
  // Immersive screens own the full viewport: the kids' RPG and the senior
  // Exam Studio both hide the light marketing BottomNav and skip its padding.
  const isImmersive = pathname === '/play' || pathname.startsWith('/senior');

  return (
    <>
      <AndroidBackHandler />
      {/* Pad the page so its bottom content clears the fixed BottomNav (mobile only). */}
      <div className={isImmersive ? undefined : 'pb-16 lg:pb-0'}>
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="text-teal text-xl animate-pulse">Loading…</div>
            </div>
          }
        >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/curriculum" element={<CurriculumPage />} />
          <Route path="/parents" element={<ParentsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/preschool" element={<PreSchoolPage />} />
          <Route path="/lower-primary" element={<LowerPrimaryPage />} />
          <Route path="/higher-primary" element={<HigherPrimaryPage />} />
          <Route path="/advanced-primary" element={<AdvancedPrimaryPage />} />
          <Route path="/secondary" element={<SecondaryPage />} />
          <Route path="/age14" element={<Age14Page />} />
          <Route path="/age15" element={<Age15Page />} />
          <Route path="/age16" element={<Age16Page />} />
          <Route path="/age17" element={<Age17Page />} />
          <Route path="/play" element={<Game />} />
          {/* Senior Exam Studio (ages 15–17) — IGCSE interface, dark theme */}
          <Route path="/senior/topics/:age" element={<SeniorTopicsPage />} />
          <Route path="/senior/activity" element={<SeniorActivityPage />} />
          <Route path="/senior/success" element={<SeniorSuccessPage />} />
          <Route path="/senior/mistakes" element={<SeniorMistakeBookPage />} />
          <Route path="/grown-up-corner" element={<GrownUpCorner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </div>
      {!isImmersive && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
