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
              seoTitle="Realistic Handwriting Generator | text2handwriting.me"
              seoDescription="Generate ultra-realistic handwriting from text. Includes natural ink smudges, varied pressure, and 3D notebook physics."
              h1="Realistic Handwriting Generator"
              subtitle="Create natural-looking handwritten pages with adjustable ink, paper, spacing, and realistic variation."
              keyword="Handwriting Generator"
            />
          } />
          <Route path="typed-text-to-handwritten-notes" element={<SeoLandingPage seoTitle="How to turn typed text into handwritten notes | text2handwriting.me" seoDescription="A practical guide to turning your own typed text into clear handwritten notes with page layout, spacing and PDF export controls." h1="How to turn typed text into handwritten notes" subtitle="Format your own notes as readable handwritten-style pages and review them before exporting." keyword="Typed text to handwritten notes" />} />
          <Route path="practical-record-formatting-guide" element={<SeoLandingPage seoTitle="Practical and lab record formatting guide | text2handwriting.me" seoDescription="Learn a clear structure for practical and lab records, then format your own draft as readable handwritten pages for review and printing." h1="Practical and lab record formatting guide" subtitle="Organize your own practical draft into a consistent, reviewable handwritten layout." keyword="Practical record formatting" />} />
          <Route path="print-ready-handwritten-pdf-guide" element={<SeoLandingPage seoTitle="Print-ready handwritten PDF export guide | text2handwriting.me" seoDescription="Prepare handwritten pages for reliable printing with a checklist for margins, page breaks, contrast, paper size and PDF preview." h1="Print-ready handwritten PDF export guide" subtitle="Use a simple preflight checklist before printing your handwritten-style PDF." keyword="Print-ready handwritten PDF" />} />

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
