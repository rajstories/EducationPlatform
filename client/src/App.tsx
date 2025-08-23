import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import ClassDetail from "@/pages/ClassDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import StudentPortal from "@/pages/StudentPortal";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import ProfileCompletion from "@/pages/ProfileCompletion";
import StudentDashboard from "@/pages/StudentDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/class/:id" component={ClassDetail} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-white font-poppins">
          <Switch>
            {/* Login pages without header/footer */}
            <Route path="/login" component={Login} />
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin">
              <AdminDashboard />
            </Route>
            <Route path="/profile-completion" component={ProfileCompletion} />
            <Route path="/student-dashboard" component={StudentDashboard} />
            
            {/* Regular pages with header/footer */}
            <Route>
              <Header />
              <main className="relative">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/class/:id" component={ClassDetail} />
                  <Route path="/about" component={About} />
                  <Route path="/contact" component={Contact} />
                  <Route path="/portal" component={StudentPortal} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Footer />
            </Route>
          </Switch>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
