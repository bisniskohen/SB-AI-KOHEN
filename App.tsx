import React, { useState } from 'react';
import CaptionGenerator from './components/CaptionGenerator';
import HookFinder from './components/HookFinder';
import { SparklesIcon } from './components/icons';

type Page = 'caption' | 'hook';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('caption');

    const NavButton = ({ page, label }: { page: Page; label: string }) => (
        <button
            onClick={() => setActivePage(page)}
            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${
                activePage === page
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
             aria-current={activePage === page}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 sm:p-6 font-sans text-white">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        AI SB KOHEN <SparklesIcon className="w-8 h-8 text-cyan-400" />
                    </h1>
                    <p className="text-lg text-slate-400">
                        Alat bantu AI untuk segala kebutuhan marketing Anda.
                    </p>
                </header>
                
                <>
                    <nav className="flex justify-center gap-4 mb-8" aria-label="Main navigation">
                        <NavButton page="caption" label="Generator Caption" />
                        <NavButton page="hook" label="Pencari Hook Produk" />
                    </nav>

                    <main>
                        {activePage === 'caption' && <CaptionGenerator />}
                        {activePage === 'hook' && <HookFinder />}
                    </main>
                </>
            </div>
        </div>
    );
};

export default App;
