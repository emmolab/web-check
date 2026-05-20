import { Suspense, lazy } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

import ErrorBoundary from 'client/components/boundaries/PageError.tsx';
import GlobalStyles from './styles/globals.tsx';

const Home = lazy(() => import('client/views/Home.tsx'));
const Results = lazy(() => import('client/views/Results.tsx'));
const About = lazy(() => import('client/views/About.tsx'));
const NotFound = lazy(() => import('client/views/NotFound.tsx'));

const Layout = () => {
  return (
    <>
      <GlobalStyles />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="/check" element={<Layout />}>
          <Route index element={<Navigate to="/" replace />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="about" element={<Navigate to="/about" replace />} />
          <Route path=":urlToScan" element={<Results />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
