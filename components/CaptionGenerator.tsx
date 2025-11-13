
import React, { useState, useCallback, ChangeEvent } from 'react';
import { CaptionAndHashtags, ImageFile } from '../types';
import { generateCaptionAndHashtags } from '../services/geminiService';
import { UploadIcon, SparklesIcon, CopyIcon, CheckIcon, LoadingSpinner, TrashIcon } from './icons';

const CaptionGenerator: React.FC = () => {
  const [productType, setProductType] = useState<string>('');
  const [detailedRequest, setDetailedRequest] = useState<string>('');
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [productDescription, setProductDescription] = useState<string>('');
  const [descriptionInputMethod, setDescriptionInputMethod] = useState<'text' | 'image'>('text');
  const [descriptionImageFile, setDescriptionImageFile] = useState<ImageFile | null>(null);

  const [result, setResult] = useState<CaptionAndHashtags | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile({
          file: file,
          preview: URL.createObjectURL(file)
      });
    }
  };
  
  const removeImage = () => {
    if(imageFile) {
        URL.revokeObjectURL(imageFile.preview);
        setImageFile(null);
    }
  }

  const handleDescriptionImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDescriptionImageFile({
          file: file,
          preview: URL.createObjectURL(file)
      });
    }
  };

  const removeDescriptionImage = () => {
    if(descriptionImageFile) {
        URL.revokeObjectURL(descriptionImageFile.preview);
        setDescriptionImageFile(null);
    }
  }


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productType.trim()) {
      setError('Jenis produk tidak boleh kosong.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopiedItem(null);

    try {
      const descText = descriptionInputMethod === 'text' ? productDescription : undefined;
      const descImg = descriptionInputMethod === 'image' ? descriptionImageFile?.file : undefined;

      const generatedResult = await generateCaptionAndHashtags(
        productType, 
        detailedRequest, 
        imageFile?.file,
        descText,
        descImg,
        );
      setResult(generatedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [productType, detailedRequest, imageFile, productDescription, descriptionInputMethod, descriptionImageFile]);

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const allContent = `${result.caption}\n\n${result.hashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard.writeText(allContent);
    setCopiedItem('all');
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
            <div>
                <label htmlFor="product-type" className="block text-sm font-medium text-slate-300 mb-2">
                Jenis Produk <span className="text-red-500">*</span>
                </label>
                <input
                id="product-type"
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="Contoh: Sepatu lari, Makanan ringan, Skincare"
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload Foto Produk (Opsional)
                </label>
                {imageFile ? (
                    <div className="relative group">
                        <img src={imageFile.preview} alt="Pratinjau produk" className="w-full h-48 object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={removeImage}
                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                aria-label="Remove image"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-md hover:border-cyan-500 transition bg-slate-700/50">
                        <UploadIcon className="w-8 h-8 text-slate-500 mb-2"/>
                        <span className="text-sm text-slate-400">Klik untuk upload gambar</span>
                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                Deskripsi Produk (Opsional)
                </label>
                <div className="flex border-b border-slate-600 mb-4">
                <button
                    type="button"
                    onClick={() => setDescriptionInputMethod('text')}
                    className={`px-4 py-2 text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-t-md ${descriptionInputMethod === 'text' ? 'border-b-2 border-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    aria-pressed={descriptionInputMethod === 'text'}
                >
                    Teks
                </button>
                <button
                    type="button"
                    onClick={() => setDescriptionInputMethod('image')}
                    className={`px-4 py-2 text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-t-md ${descriptionInputMethod === 'image' ? 'border-b-2 border-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    aria-pressed={descriptionInputMethod === 'image'}
                >
                    SS deskripsi
                </button>
                </div>

                {descriptionInputMethod === 'text' ? (
                <textarea
                    id="product-description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Contoh: Terbuat dari bahan premium, cocok untuk segala cuaca..."
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
                ) : (
                    descriptionImageFile ? (
                    <div className="relative group">
                        <img src={descriptionImageFile.preview} alt="Pratinjau deskripsi" className="w-full h-48 object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={removeDescriptionImage}
                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                aria-label="Remove description image"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <label htmlFor="description-image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-md hover:border-cyan-500 transition bg-slate-700/50">
                        <UploadIcon className="w-8 h-8 text-slate-500 mb-2"/>
                        <span className="text-sm text-slate-400">Klik untuk upload screenshot</span>
                        <input id="description-image-upload" type="file" accept="image/*" onChange={handleDescriptionImageChange} className="hidden" />
                    </label>
                )
                )}
            </div>

            <div>
                <label htmlFor="detailed-request" className="block text-sm font-medium text-slate-300 mb-2">
                Jelaskan gaya yang kamu inginkan (Opsional)
                </label>
                <textarea
                id="detailed-request"
                value={detailedRequest}
                onChange={(e) => setDetailedRequest(e.target.value)}
                placeholder="Contoh: Gaya bahasa lucu, target audiens anak muda, gunakan emoji"
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
            </div>
            </div>

            <div className="mt-8">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105"
            >
                {isLoading ? (
                <>
                    <LoadingSpinner className="w-5 h-5 mr-3" />
                    Generating...
                </>
                ) : (
                <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate Sekarang
                </>
                )}
            </button>
            </div>
        </form>
        </div>

        {/* Result Section */}
        <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-4">HASIL</h2>
            <div className="flex-grow flex items-center justify-center">
            {isLoading ? (
                <div className="text-center text-slate-400">
                    <LoadingSpinner className="w-12 h-12 mx-auto mb-4"/>
                    <p>AI sedang meracik kata-kata...</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">
                    <p className="font-semibold">Oops! Terjadi Kesalahan</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : result ? (
                <div className="w-full space-y-6">
                    <button
                        onClick={handleCopyAll}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border-2 border-cyan-600 text-cyan-400 font-semibold hover:bg-cyan-600 hover:text-white transition-all duration-300"
                    >
                        {copiedItem === 'all' ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                        {copiedItem === 'all' ? 'Semua Tersalin!' : 'Salin Keduanya'}
                    </button>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-slate-300">Caption</h3>
                            <button onClick={() => handleCopyToClipboard(result.caption, 'caption')} className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition">
                                {copiedItem === 'caption' ? <CheckIcon className="w-4 h-4 mr-1"/> : <CopyIcon className="w-4 h-4 mr-1"/>}
                                {copiedItem === 'caption' ? 'Tersalin!' : 'Salin'}
                            </button>
                        </div>
                        <p className="bg-slate-700/50 p-4 rounded-md text-slate-200 whitespace-pre-wrap">{result.caption}</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-slate-300">Hashtags</h3>
                            <button onClick={() => handleCopyToClipboard(result.hashtags.map(tag => `#${tag}`).join(' '), 'hashtags')} className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition">
                                {copiedItem === 'hashtags' ? <CheckIcon className="w-4 h-4 mr-1"/> : <CopyIcon className="w-4 h-4 mr-1"/>}
                                {copiedItem === 'hashtags' ? 'Tersalin!' : 'Salin'}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 p-4 bg-slate-700/50 rounded-md">
                            {result.hashtags.map((tag, index) => (
                                <span key={index} className="bg-cyan-900/70 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-500">
                    <p>Hasil caption dan hashtag Anda akan muncul di sini.</p>
                </div>
            )}
        </div>
        </div>
    </div>
  );
};

export default CaptionGenerator;
