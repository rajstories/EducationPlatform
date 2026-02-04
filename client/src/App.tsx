import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import ClassDetail from "@/pages/ClassDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import NotFound from "@/pages/not-found";
import { ResultAnnouncement } from "@/components/ResultAnnouncement";

function AdminGate() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const allowed = sessionStorage.getItem("adminAccess") === "1";
    if (!allowed) {
      setLocation("/");
    }
  }, [setLocation]);

  const allowed = sessionStorage.getItem("adminAccess") === "1";
  return allowed ? <AdminDashboard /> : null;
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-white font-poppins">
          <Switch>
            {/* Admin routes (no header/footer) */}
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin" component={AdminGate} />


            {/* Regular pages with header/footer */}
            <Route>
              <Header />
              <main className="relative">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/class/:id" component={ClassDetail} />
                  <Route path="/about" component={About} />
                  <Route path="/contact" component={Contact} />

                  <Route path="/results" component={() => (
                    <div className="min-h-screen bg-gray-50 py-8">
                      <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-3xl font-bold text-center mb-8 text-navy">Latest Results</h1>
                        <ResultAnnouncement />
                      </div>
                    </div>
                  )} />
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
