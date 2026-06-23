import { Component, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";
import ScanCard from "./pages/ScanCard";
import NotFound from "./pages/NotFound";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" style={{ padding: 24, fontFamily: 'Heebo, sans-serif', color: '#fff', background: '#111', minHeight: '100vh' }}>
          <h1 style={{ color: '#f87171', fontSize: 22, marginBottom: 12 }}>⚠️ שגיאה בטעינת המשחק</h1>
          <p style={{ color: '#9ca3af', marginBottom: 8 }}>אנא רענן את הדף (F5). אם הבעיה נמשכת, פנה לתמיכה.</p>
          <pre style={{ background: '#1f2937', padding: 12, borderRadius: 8, fontSize: 12, color: '#fca5a5', overflowX: 'auto' }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<GameRoom />} />
            <Route path="/scan" element={<ScanCard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
