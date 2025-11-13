
import React from 'react';
import { WarningIcon } from './icons';

const ApiKeyMissing: React.FC = () => {
    return (
        <div className="w-full max-w-2xl mx-auto mt-8 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-amber-500/50">
            <div className="flex flex-col items-center text-center">
                <WarningIcon className="w-16 h-16 text-amber-400 mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Konfigurasi API Key Dibutuhkan</h2>
                <p className="text-slate-400 mb-6 max-w-lg">
                    Aplikasi ini tidak bisa berjalan karena API Key untuk Google Gemini belum diatur di environment Vercel Anda.
                </p>
                
                <div className="text-left w-full bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-lg text-white mb-3">Cara Memperbaiki di Vercel:</h3>
                    <ol className="list-decimal list-inside space-y-3 text-slate-300">
                        <li>Buka proyek Anda di dashboard Vercel.</li>
                        <li>
                            Pergi ke tab <code className="bg-slate-700 text-cyan-400 px-2 py-1 rounded-md text-sm">Settings</code> lalu pilih <code className="bg-slate-700 text-cyan-400 px-2 py-1 rounded-md text-sm">Environment Variables</code>.
                        </li>
                        <li>
                            Buat variabel baru dengan detail berikut:
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                                <li><strong>Name:</strong> <code className="bg-slate-700 text-cyan-400 px-1.5 py-0.5 rounded">API_KEY</code></li>
                                <li><strong>Value:</strong> <code className="bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">[tempel API Key Anda di sini]</code></li>
                            </ul>
                        </li>
                        <li>Simpan, lalu lakukan <strong>Redeploy</strong> pada proyek Anda agar perubahan diterapkan.</li>
                    </ol>
                </div>
                 <p className="text-xs text-slate-500 mt-6">
                    Setelah API Key ditambahkan dan di-deploy ulang, aplikasi akan berfungsi secara otomatis.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyMissing;
