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

function ProtectedRoute({ component: Component, requiredRole }: { component: any, requiredRole: 'student' | 'faculty' | 'admin' }) {
  const currentUserJson = localStorage.getItem('currentUser');
  
  if (!currentUserJson) {
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
    return <Redirect to={roleMap[currentUser.role] || '/'} />;
  }

  return <Component />;
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
        <ProtectedRoute 
          component={() => currentUser ? <MainLayout user={currentUser}><StudentDashboard /></MainLayout> : <Login />} 
          requiredRole="student" 
        />
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty/*">
        <ProtectedRoute 
          component={() => currentUser ? <MainLayout user={currentUser}><AdminDashboard /></MainLayout> : <Login />} 
          requiredRole="faculty" 
        />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/*">
        <ProtectedRoute 
          component={() => currentUser ? <MainLayout user={currentUser}><AdminDashboard /></MainLayout> : <Login />} 
          requiredRole="admin" 
        />
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
