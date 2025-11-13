import React, { useState, useCallback } from 'react';
import { generateProductHooks } from '../services/geminiService';
import { ProductHooks } from '../types';
import { SparklesIcon, CopyIcon, CheckIcon, LoadingSpinner } from './icons';

const HookFinder: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [features, setFeatures] = useState('');
    const [hookReference, setHookReference] = useState('');
    
    const [result, setResult] = useState<ProductHooks | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedItem, setCopiedItem] = useState<number | null>(null);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName.trim()) {
            setError('Nama produk tidak boleh kosong.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        setCopiedItem(null);

        try {
            const generatedResult = await generateProductHooks(productName, targetAudience, features, hookReference);
            setResult(generatedResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
        } finally {
            setIsLoading(false);
        }
    }, [productName, targetAudience, features, hookReference]);

    const handleCopyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(index);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="product-name" className="block text-sm font-medium text-slate-300 mb-2">
                            Nama Produk <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="product-name"
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Contoh: Kopi Bubuk 'Energi Pagi'"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="target-audience" className="block text-sm font-medium text-slate-300 mb-2">
                            Target Audiens (Opsional)
                        </label>
                        <input
                            id="target-audience"
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="Contoh: Mahasiswa, pekerja kantor, pecinta alam"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="features" className="block text-sm font-medium text-slate-300 mb-2">
                            Fitur Unggulan (Opsional)
                        </label>
                        <textarea
                            id="features"
                            value={features}
                            onChange={(e) => setFeatures(e.target.value)}
                            placeholder="Contoh: 100% biji arabika, dipanggang segar setiap hari, kemasan ramah lingkungan"
                            rows={3}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        />
                    </div>
                     <div>
                        <label htmlFor="hook-reference" className="block text-sm font-medium text-slate-300 mb-2">
                            Referensi Hook (Opsional)
                        </label>
                        <textarea
                            id="hook-reference"
                            value={hookReference}
                            onChange={(e) => setHookReference(e.target.value)}
                            placeholder="Contoh: Buat hook yang lucu dan menggunakan bahasa gaul, atau formal dan profesional"
                            rows={3}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner className="w-5 h-5 mr-3" />
                                    Mencari ide...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Cari Hook Sekarang
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Result Section */}
            <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4">HASIL HOOK</h2>
                <div className="flex-grow flex items-center justify-center">
                    {isLoading ? (
                        <div className="text-center text-slate-400">
                            <LoadingSpinner className="w-12 h-12 mx-auto mb-4"/>
                            <p>AI sedang mencari ide-ide cemerlang...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">
                            <p className="font-semibold">Oops! Terjadi Kesalahan</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : result ? (
                        <div className="w-full">
                            <ul className="space-y-3">
                                {result.hooks.map((hook, index) => (
                                    <li key={index} className="bg-slate-700/50 p-4 rounded-md flex justify-between items-center gap-4">
                                        <p className="text-slate-200 flex-grow">{hook}</p>
                                        <button 
                                            onClick={() => handleCopyToClipboard(hook, index)}
                                            className="flex-shrink-0 flex items-center justify-center p-2 rounded-full text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 transition"
                                            aria-label="Salin hook"
                                        >
                                            {copiedItem === index ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <p>Ide hook produk Anda akan muncul di sini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HookFinder;