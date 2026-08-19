import React, { useState, useEffect } from "react";
import { Settings, Save, Smartphone, Image as ImageIcon, Building } from 'lucide-react';
import api from '../../lib/api';
import { useDispatch } from 'react-redux';
import { updateSettings } from '../../store/slices/dataSlice';

export const AdminPaymentManagement = () => {
  const dispatch = useDispatch();
  const [upiId, setUpiId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        if (res.data) {
          setUpiId(res.data.upiId || '');
          setAccountName(res.data.accountName || '');
          setQrCodeUrl(res.data.qrCodeUrl || '');
          setPaymentInstructions(res.data.paymentInstructions || '');
          // Sync with redux for frontend immediate usage
          dispatch(updateSettings(res.data));
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { upiId, accountName, qrCodeUrl, paymentInstructions };
      await api.put('/api/admin/settings', payload);
      dispatch(updateSettings(payload));
      alert('Payment settings updated successfully!');
    } catch (error) {
      console.error("Failed to update settings", error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Payment Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure global platform payment options (UPI ID & QR Code).</p>
        </div>
      </header>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 max-w-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
          <Settings className="mr-2 text-red-500" />
          Deposit & Payment Settings
        </h2>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Holder Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-sm"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company UPI ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-sm"
                  placeholder="e.g. 1234567890@upi"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Instructions</label>
            <textarea
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              rows={3}
              className="block w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-sm"
              placeholder="Enter any specific payment instructions for users..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload UPI QR Code</label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-black/40 transition-colors cursor-pointer text-center">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              {qrCodeUrl ? (
                <div className="relative">
                  <img src={qrCodeUrl} alt="QR Code preview" className="h-48 object-contain rounded-md" />
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click or drag to upload QR code</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/30 text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-95 disabled:opacity-70 group"
            >
              <Save className="mr-2 h-5 w-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
