import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

import Home from 'client/views/Home.tsx';
import Results from 'client/views/Results.tsx';
import About from 'client/views/About.tsx';
import NotFound from 'client/views/NotFound.tsx';

import ErrorBoundary from 'client/components/boundaries/PageError.tsx';
import GlobalStyles from './styles/globals.tsx';

const Layout = () => {
  return (
    <>
      <GlobalStyles />
      <Outlet />
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
