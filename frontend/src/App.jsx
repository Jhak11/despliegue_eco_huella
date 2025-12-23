import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GamifiedProfile from './pages/GamifiedProfile';
import Missions from './pages/Missions';
import Education from './pages/Education'; // New Module
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results';
import Pet from './pages/Pet';
import ChatWidget from './components/ChatWidget'; // Module 6: EcoBot
import Navbar from './components/Navbar';
import SupabaseTest from './components/SupabaseTest';
import './index.css';

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
}

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return user ? <Navigate to="/dashboard" /> : children;
}

function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <Navbar />
            <div className="main-layout">
                <main className="container">
                    <Outlet />
                </main>
                <ChatWidget />
            </div>
        </ProtectedRoute>
    );
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />

            <Route path="/supabase-test" element={<SupabaseTest />} />

            {/* Protected Routes with Navbar Layout */}
            <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/gamified-profile" element={<GamifiedProfile />} />
                <Route path="/missions" element={<Missions />} />
                <Route path="/education" element={<Education />} />
                <Route path="/questionnaire" element={<Questionnaire />} />
                <Route path="/results" element={<Results />} />
                <Route path="/pet" element={<Pet />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
