import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { SimpleChecklistTest } from "./components/checklist/SimpleChecklistTest";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showChecklistTest, setShowChecklistTest] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showChecklistTest ? (
          // Checklist Test Mode
          <div>
            <button
              onClick={() => setShowChecklistTest(false)}
              className="fixed top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors z-50"
            >
              ← Back to Main App
            </button>
            <SimpleChecklistTest />
          </div>
        ) : (
          // Normal App Mode
          <>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            
            {/* Checklist Test Toggle Button */}
            <button
              onClick={() => setShowChecklistTest(true)}
              className="fixed bottom-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 transition-colors z-50"
              title="Test Checklist System"
            >
              🏠 Test
            </button>
          </>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
