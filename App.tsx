
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './components/GameContainer';
import { fetchJungleLore } from './services/geminiService';

const App: React.FC = () => {
  const [lore, setLore] = useState("Explore the deep jungle...");
  const [isLoreLoading, setIsLoreLoading] = useState(false);
  const lastUpdateTime = useRef(0);

  const updateLore = useCallback(async (location: string) => {
    if (Date.now() - lastUpdateTime.current < 15000) return; // Rate limit lore updates
    
    setIsLoreLoading(true);
    const newLore = await fetchJungleLore(location);
    setLore(newLore);
    setIsLoreLoading(false);
    lastUpdateTime.current = Date.now();
  }, []);

  return (
    <div className="relative w-full h-screen bg-emerald-950 overflow-hidden text-white flex flex-col">
      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-md pointer-events-auto">
          <h1 className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-1">Current Discovery</h1>
          <p className={`text-lg italic transition-opacity duration-1000 ${isLoreLoading ? 'opacity-50' : 'opacity-100'}`}>
            "{lore}"
          </p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-auto">
          <p className="retro-font text-[10px] text-emerald-400">Controls: ARROW KEYS</p>
        </div>
      </div>

      <GameContainer onLocationChange={updateLore} />

      {/* Footer Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-3 rounded-full border border-emerald-500/30 backdrop-blur-sm z-10">
        <span className="text-emerald-200 text-sm font-medium">Use arrow keys to traverse the ancient canopy.</span>
      </div>
    </div>
  );
};

export default App;
