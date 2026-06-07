import { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import HomePage from './pages/HomePage';
// Marketing pages are lazy-loaded: they're only reached from secondary nav, so
// they shouldn't weigh down the initial Home paint on low-end Android.
const LandingPage = lazy(() => import('./pages/LandingPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const CurriculumPage = lazy(() => import('./pages/CurriculumPage'));
const ParentsPage = lazy(() => import('./pages/ParentsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PreSchoolPage = lazy(() => import('./pages/PreSchoolPage'));
const LowerPrimaryPage = lazy(() => import('./pages/LowerPrimaryPage'));
const HigherPrimaryPage = lazy(() => import('./pages/HigherPrimaryPage'));
const AdvancedPrimaryPage = lazy(() => import('./pages/AdvancedPrimaryPage'));
const SecondaryPage = lazy(() => import('./pages/SecondaryPage'));
const Age14Page = lazy(() => import('./pages/Age14Page'));
const Age15Page = lazy(() => import('./pages/Age15Page'));
const Age16Page = lazy(() => import('./pages/Age16Page'));
const Age17Page = lazy(() => import('./pages/Age17Page'));
const GrownUpCorner = lazy(() => import('./pages/GrownUpCorner'));
// The kids' RPG carries the large procedural engine; lazy-load it so it only
// ships when a child actually opens /play.
const Game = lazy(() => import('./game/Game'));
// The Academy (ages 13–17) is lazy-loaded: its large IGCSE engine only ships to
// players who actually open ages 13–17, keeping the kids' start fast.
const SeniorTopicsPage = lazy(() => import('./senior/pages/TopicsPage'));
const SeniorActivityPage = lazy(() => import('./senior/pages/ActivityPage'));
const SeniorSuccessPage = lazy(() => import('./senior/pages/SuccessPage'));
const SeniorMistakeBookPage = lazy(() => import('./senior/pages/MistakeBookPage'));
const SeniorFormulaVaultPage = lazy(() => import('./senior/pages/FormulaVaultPage'));
const SeniorDashboardPage = lazy(() => import('./senior/pages/DashboardPage'));
const SeniorStudyPlannerPage = lazy(() => import('./senior/pages/StudyPlannerPage'));
import BottomNav from './components/BottomNav';
import LoadingScreen from './components/LoadingScreen';
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
        <Suspense fallback={<LoadingScreen dark={pathname.startsWith('/senior')} />}>
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
          <Route path="/senior/formulas/:topicId" element={<SeniorFormulaVaultPage />} />
          <Route path="/senior/dashboard" element={<SeniorDashboardPage />} />
          <Route path="/senior/planner" element={<SeniorStudyPlannerPage />} />
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
    // reducedMotion="user" makes every Motion animation honour the OS
    // "Reduce motion" setting — transforms/large movement are dropped for users
    // who get motion sick or are distracted by it, with zero per-component work.
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </MotionConfig>
  );
}
