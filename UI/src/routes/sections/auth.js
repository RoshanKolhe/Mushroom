import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// layouts
import CompactLayout from 'src/layouts/compact';
import AuthModernLayout from 'src/layouts/auth/modern';
import AuthClassicLayout from 'src/layouts/auth/classic';
import AuthModernCompactLayout from 'src/layouts/auth/modern-compact';
// components
import { SplashScreen } from 'src/components/loading-screen';
import { AuthGuard, GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

// CLASSIC
const LoginClassicPage = lazy(() => import('src/pages/auth-demo/classic/login'));
const RegisterClassicPage = lazy(() => import('src/pages/auth-demo/classic/register'));
const ForgotPasswordClassicPage = lazy(() => import('src/pages/auth-demo/classic/forgot-password'));
const VerifyClassicPage = lazy(() => import('src/pages/auth-demo/classic/verify'));
const NewPasswordClassicPage = lazy(() => import('src/pages/auth-demo/classic/new-password'));

// MODERN
const LoginModernPage = lazy(() => import('src/pages/auth-demo/modern/login'));
const RegisterModernPage = lazy(() => import('src/pages/auth-demo/modern/register'));
const ForgotPasswordModernPage = lazy(() => import('src/pages/auth-demo/modern/forgot-password'));
const VerifyModernPage = lazy(() => import('src/pages/auth-demo/modern/verify'));
const NewPasswordModernPage = lazy(() => import('src/pages/auth-demo/modern/new-password'));

// ----------------------------------------------------------------------

const authModern = {
  path: 'admin',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthModernLayout>
          <LoginModernPage />
        </AuthModernLayout>
      ),
    },
    {
      path: 'register',
      element: (
        <AuthModernLayout>
          <RegisterModernPage />
        </AuthModernLayout>
      ),
    },
    {
      element: (
        <AuthModernCompactLayout>
          <Outlet />
        </AuthModernCompactLayout>
      ),
      children: [
        { path: 'forgot-password', element: <ForgotPasswordModernPage /> },
        { path: 'new-password', element: <NewPasswordModernPage /> },
        { path: 'verify', element: <VerifyModernPage /> },
      ],
    },
  ],
};

export const authRoutes = [
  {
    path: 'auth',
    children: [authModern],
  },
];
