import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SiteLogo from '../common/SiteLogo';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/** Redirects unauthenticated users to /auth?redirect=<current-path> */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate, location.pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-paper gap-4">
                <div className="relative">
                    <SiteLogo size={44} className="animate-pulse" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                    <div className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                    <span>Verifying student session...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    return <>{children}</>;
}
