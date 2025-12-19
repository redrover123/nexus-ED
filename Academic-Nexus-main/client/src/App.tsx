import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { MainLayout } from "@/components/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "@/pages/Login";
import ChangePassword from "@/pages/ChangePassword";
import NotFound from "@/pages/not-found";

// Placeholder Pages
import StudentDashboard from "@/pages/student/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import SeatingDashboard from "@/pages/seating/Dashboard";
import ClubDashboard from "@/pages/club/Dashboard";

interface CurrentUser {
  id: string;
  role: 'student' | 'faculty' | 'admin';
  name?: string;
  additional_roles?: string[];
}

interface NavCard {
  title: string;
  items: { label: string; href: string }[];
}

function ProtectedRoute({ 
  requiredRole, 
  children 
}: { 
  requiredRole: 'student' | 'faculty' | 'admin',
  children: React.ReactNode
}) {
  const currentUserJson = localStorage.getItem('currentUser');
  
  if (!currentUserJson) {
    console.warn('⚠️ No user found in localStorage, redirecting to login');
    return <Redirect to="/" />;
  }

  const currentUser: CurrentUser = JSON.parse(currentUserJson);

  // If role doesn't match, redirect to their correct dashboard
  if (currentUser.role !== requiredRole) {
    const roleMap: Record<string, string> = {
      'student': '/student/dashboard',
      'faculty': '/faculty/dashboard',
      'admin': '/admin/dashboard',
    };
    console.warn(`⚠️ Role mismatch. User role: ${currentUser.role}, Required: ${requiredRole}. Redirecting...`);
    return <Redirect to={roleMap[currentUser.role] || '/'} />;
  }

  console.log(`✅ Access granted for role: ${requiredRole}`);
  return <>{children}</>;
}

function Router() {
  const currentUserJson = localStorage.getItem('currentUser');
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) as CurrentUser : null;

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/change-password" component={ChangePassword} />
      
      {/* Student Routes */}
      <Route path="/student/*">
        {currentUser ? (
          <ProtectedRoute requiredRole="student">
            <MainLayout user={currentUser}>
              <StudentDashboard />
            </MainLayout>
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty/*">
        {currentUser ? (
          <ProtectedRoute requiredRole="faculty">
            <MainLayout user={currentUser}>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/*">
        {currentUser ? (
          <ProtectedRoute requiredRole="admin">
            <MainLayout user={currentUser}>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>

      {/* Redirect /seating-manager to /faculty/seating */}
      <Route path="/seating-manager/*">
        <Redirect to="/faculty/seating" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const currentUserJson = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ErrorBoundary>
          <AppLayout>
            <Router />
          </AppLayout>
        </ErrorBoundary>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
