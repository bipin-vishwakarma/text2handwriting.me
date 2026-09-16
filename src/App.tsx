import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ScrollToTop from './components/layout/ScrollToTop';

// Lazy Load Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Legal & Support Pages
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const Disclaimer = lazy(() => import('./pages/legal/Disclaimer'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-paper">
    <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function InnerApp() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth & onboarding — standalone, no RootLayout navbar */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          {/* Local drafting/preview needs no account; checkout asks for sign-in. */}
          <Route path="editor" element={<EditorPage />} />

          {/* Legal Pages */}
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="cookies" element={<CookiePolicy />} />

          {/* Support Pages */}
          <Route path="contact" element={<Navigate to="/support" replace />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="changelog" element={<ChangelogPage />} />
          <Route path="pricing" element={<PricingPage />} />

          {/* SEO Landing Pages */}
          <Route path="text-to-cursive" element={
            <SeoLandingPage 
              seoTitle="Text to Cursive Converter | Generate Realistic Cursive Handwriting"
              seoDescription="Convert your typed text into beautiful, flowing cursive handwriting. Perfect for letters, invitations, and stylish assignments."
              h1="Text to Cursive Converter"
              subtitle="Instantly transform your boring digital text into stunning, realistic cursive handwriting."
              keyword="Text to Cursive"
            />
          } />
          <Route path="assignment-maker-online" element={
            <SeoLandingPage 
              seoTitle="Assignment Maker Online | Text to Handwriting Converter"
              seoDescription="The #1 assignment maker online. Type your text and instantly generate realistic handwritten notebook pages for your college or school assignments."
              h1="Assignment Maker Online"
              subtitle="Save hours of writing. Type your assignment and let our engine convert it into realistic handwriting on lined paper."
              keyword="Assignment Maker"
            />
          } />
          <Route path="realistic-handwriting-generator" element={
            <SeoLandingPage 
              seoTitle="Realistic Handwriting Generator | Text2Handwriting"
              seoDescription="Generate ultra-realistic handwriting from text. Includes natural ink smudges, varied pressure, and 3D notebook physics."
              h1="Realistic Handwriting Generator"
              subtitle="Create natural-looking handwritten pages with adjustable ink, paper, spacing, and realistic variation."
              keyword="Handwriting Generator"
            />
          } />

          {/* Redirects for deleted pages */}
          <Route path="features" element={<Navigate to="/#features" replace />} />
          <Route path="how-it-works" element={<Navigate to="/#how-it-works" replace />} />
          <Route path="sitemap" element={<Navigate to="/" replace />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ScrollToTop />
            <InnerApp />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
