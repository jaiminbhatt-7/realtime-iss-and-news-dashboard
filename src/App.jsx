import React, { useState, useEffect } from 'react';
import { Moon, Sun, Rocket } from 'lucide-react';
import ISSTracker from './components/ISSTracker';
import NewsDashboard from './components/NewsDashboard';
import DataCharts from './components/DataCharts';
import Chatbot from './components/Chatbot';
import { useISSData } from './hooks/useISSData';
import { useNewsData } from './hooks/useNewsData';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const issData = useISSData();
  const newsData = useNewsData();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
            <Rocket className="text-blue-500" />
            <span>Space<span className="text-blue-500">Dash</span></span>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-8">
        <section>
          <ISSTracker issData={issData} />
        </section>
        
        <section>
          <DataCharts issSpeeds={issData.speeds} newsArticles={newsData.articles} />
        </section>

        <section>
          <NewsDashboard newsData={newsData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground mt-auto bg-card">
        <p>Built with React, Vite, Leaflet, and Hugging Face API.</p>
        <p className="mt-1 opacity-70">FOAI Endsem Project</p>
      </footer>

      {/* AI Chatbot Widget */}
      <Chatbot issData={issData} newsData={newsData} />
    </div>
  );
}

export default App;
