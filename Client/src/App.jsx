import { lazy, Suspense, useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';

import Home from './Pages/User/Home';
import { useTheme } from './Context/themContext';
import ProtectedRoute from './Pages/User/ProtectedRoute.jsx';
import Result404 from './Pages/Result404.jsx';

const VisitorView = lazy(() => import('./Pages/User/VistorView.jsx'));
const UserPage = lazy(() => import('./Pages/User/UserPage'));
const User = lazy(() => import('./Pages/User/UserLogin'));
const AdminVisitorView = lazy(() =>
  import('./Pages/Admin/AdminVisitorView.jsx')
);

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<Home />} />
        <Route path="/:id/visitors" element={<VisitorView />} />
        <Route
          path="/user"
          element={
            <Suspense
              fallback={
                <div className="w-screen h-screen flex   justify-center items-center bg-black text-white">
                  <p>Loading..</p>
                </div>
              }
            >
              <User />
            </Suspense>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <Suspense
              fallback={
                <div className="w-screen h-screen flex   justify-center items-center bg-black text-white">
                  <p>Loading..</p>
                </div>
              }
            >
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/:id/visitors"
          element={
            <Suspense
              fallback={
                <div className="w-screen h-screen flex justify-center items-center bg-black text-white">
                  <p>Loading..</p>
                </div>
              }
            >
              <ProtectedRoute>
                <VisitorView /> {/* Normal user */}
              </ProtectedRoute>
            </Suspense>
          }
        />
        // Admin Visitor View
        <Route
          path="/admin/visitors"
          element={
            <Suspense
              fallback={
                <div className="w-screen h-screen flex justify-center items-center bg-black text-white">
                  <p>Loading..</p>
                </div>
              }
            >
              <ProtectedRoute>
                <AdminVisitorView /> {/* Admin page */}
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route path="*" element={<Result404 />} />
      </Routes>
    </>
  );
}

export default App;
