import React, { useState } from 'react';
import { ArrowLeft, Smartphone, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Download = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadApk = async () => {
    setDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);
    const downloadUrl = (import.meta.env.VITE_APP_DOWNLOAD_URL || import.meta.env.NEXT_PUBLIC_APP_DOWNLOAD_URL || '/downloads/app-release.apk').trim();
    
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        setDownloadError('APK not uploaded yet.');
        return;
      }
      
      const contentType = res.headers.get('content-type') || '';
      const text = await res.clone().text().catch(() => '');
      
      if (contentType.includes('text/html') || text.includes('THIS_IS_A_PLACEHOLDER_APK_FILE')) {
        setDownloadError('APK not uploaded yet.');
        return;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'app-release.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
    } catch (err) {
      setDownloadError('APK not uploaded yet.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212] min-h-screen text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Download App</h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg shadow-primary-500/30">
            <Smartphone size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Download Our App</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm max-w-md mx-auto">
            Get the official Earning One mobile application for Android. Enjoy all features on the go with our optimized mobile experience.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5">
                <CheckCircle size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Optimized Performance</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fast loading and smooth navigation</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5">
                <CheckCircle size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Secure & Reliable</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your data is protected with encryption</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5">
                <CheckCircle size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">All Features Included</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Access all platform features on mobile</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadApk}
          disabled={downloading}
          className="w-full flex items-center justify-center space-x-3 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Preparing Download...</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Download APK</span>
            </>
          )}
        </button>

        {downloadSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl flex items-center text-green-700 dark:text-green-400 text-sm font-medium">
            <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            <span>Download started successfully! Check your downloads folder.</span>
          </div>
        )}

        {downloadError && (
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center text-amber-700 dark:text-amber-400 text-sm font-medium">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        <div className="text-center pt-6 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs text-gray-400 font-medium">Version 1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Requires Android 5.0 or higher</p>
        </div>
      </div>
    </div>
  );
};
