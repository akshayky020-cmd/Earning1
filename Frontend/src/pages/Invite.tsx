import React from 'react';
import { ArrowLeft, Copy, Share2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Invite = () => {
  const navigate = useNavigate();
  const inviteCode = 'MINER2024';
  const inviteLink = `https://investpro.app/register?ref=${inviteCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212]  text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Invite Friends</h1>
      </header>

      <div className="p-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white shadow-lg shadow-primary-500/20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <Users size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Invite & Earn</h2>
            <p className="text-primary-100 text-sm mb-6">Get 10% commission on every friend's first rental</p>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20 mb-4">
              <p className="text-xs text-primary-100 font-semibold uppercase tracking-widest mb-1">Your Invite Code</p>
              <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                <span className="text-xl font-bold tracking-wider">{inviteCode}</span>
                <button onClick={() => copyToClipboard(inviteCode)} className="text-primary-200 hover:text-white transition-colors">
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <button onClick={() => copyToClipboard(inviteLink)} className="w-full py-3 bg-white text-primary-600 rounded-xl font-bold shadow-md flex items-center justify-center transition-transform active:scale-95">
              <Share2 size={18} className="mr-2" /> Share Invite Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
