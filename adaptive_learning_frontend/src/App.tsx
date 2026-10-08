import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/ui/States';

const LandingPage = lazy(() => import('@/pages/Landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/Login/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/Signup/SignupPage').then((m) => ({ default: m.SignupPage })));
const OnboardingPage = lazy(() => import('@/pages/Onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TutorPage = lazy(() => import('@/pages/Tutor/TutorPage').then((m) => ({ default: m.TutorPage })));
const KnowledgeBasePage = lazy(() => import('@/pages/Knowledge/KnowledgeBasePage').then((m) => ({ default: m.KnowledgeBasePage })));
const DocumentViewerPage = lazy(() => import('@/pages/Knowledge/DocumentViewerPage').then((m) => ({ default: m.DocumentViewerPage })));
const LearningPage = lazy(() => import('@/pages/Learning/LearningPage').then((m) => ({ default: m.LearningPage })));
const LearningWorkspacePage = lazy(() => import('@/pages/Learning/LearningWorkspacePage').then((m) => ({ default: m.LearningWorkspacePage })));
const AssessmentListPage = lazy(() => import('@/pages/Assessment/AssessmentListPage').then((m) => ({ default: m.AssessmentListPage })));
const AssessmentQuizPage = lazy(() => import('@/pages/Assessment/AssessmentQuizPage').then((m) => ({ default: m.AssessmentQuizPage })));
const AssessmentResultPage = lazy(() => import('@/pages/Assessment/AssessmentResultPage').then((m) => ({ default: m.AssessmentResultPage })));
const ProgressPage = lazy(() => import('@/pages/Progress/ProgressPage').then((m) => ({ default: m.ProgressPage })));
const RevisionPage = lazy(() => import('@/pages/Revision/RevisionPage').then((m) => ({ default: m.RevisionPage })));
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const KnowledgeMapPage = lazy(() => import('@/pages/KnowledgeMap/KnowledgeMapPage').then((m) => ({ default: m.KnowledgeMapPage })));
const DemoPage = lazy(() => import('@/pages/Demo/DemoPage').then((m) => ({ default: m.DemoPage })));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingState label="Loading..." />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/demo" element={<DemoPage />} />

          {/* Authenticated */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/knowledge/:id" element={<DocumentViewerPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/learning/:id" element={<LearningWorkspacePage />} />
            <Route path="/assessment" element={<AssessmentListPage />} />
            <Route path="/assessment/:id" element={<AssessmentQuizPage />} />
            <Route path="/assessment/:id/result" element={<AssessmentResultPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/revision" element={<RevisionPage />} />
            <Route path="/knowledge-map" element={<KnowledgeMapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
