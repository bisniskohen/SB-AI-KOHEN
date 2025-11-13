
import React from 'react';
import { WarningIcon } from './icons';

const ApiKeyGuide: React.FC = () => {
    return (
        <div className="w-full text-center bg-slate-800 p-6 rounded-2xl border-2 border-amber-500/50 animate-fade-in">
            <div className="flex flex-col items-center">
                <WarningIcon className="w-12 h-12 text-amber-400 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Langkah Terakhir: Atur API Key</h3>
                <p className="text-slate-400 text-sm mb-5 max-w-md">
                    Aplikasi ini butuh "kunci" untuk bisa terhubung dengan AI. Anda perlu mengatur kunci ini di Vercel.
                </p>
                
                <div className="text-left w-full bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-semibold text-md text-white mb-3">Ikuti Langkah Ini di Vercel:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
                        <li>
                            Buka Proyek &gt; <code className="bg-slate-700 text-cyan-400 px-1.5 py-0.5 rounded">Settings</code> &gt; <code className="bg-slate-700 text-cyan-400 px-1.5 py-0.5 rounded">Environment Variables</code>.
                        </li>
                        <li>
                            Buat variabel baru:
                            <ul className="list-disc list-inside ml-5 mt-1 text-xs">
                                <li><strong>Name:</strong> <code className="bg-slate-700 text-cyan-400 px-1.5 py-0.5 rounded">API_KEY</code></li>
                                <li><strong>Value:</strong> <code className="bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">[tempel API Key Anda]</code></li>
                            </ul>
                        </li>
                        <li>
                            <strong>Penting:</strong> Setelah disimpan, deploy ulang proyek Anda dari tab <code className="bg-slate-700 text-cyan-400 px-1.5 py-0.5 rounded">Deployments</code>.
                        </li>
                    </ol>
                </div>
                 <p className="text-xs text-slate-500 mt-4">
                    Setelah selesai, aplikasi akan langsung berfungsi.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyGuide;
