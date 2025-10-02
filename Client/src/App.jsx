import { lazy, Suspense, useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';

import Home from './Pages/User/Home';
import { useTheme } from './Context/themContext';
const UserPage = lazy(() => import('./Pages/User/UserPage'));
const User = lazy(() => import('./Pages/User/UserLogin'));

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
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
              <UserPage />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
