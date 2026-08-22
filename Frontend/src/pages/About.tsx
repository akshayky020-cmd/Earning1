import React from 'react';
import { ArrowLeft, Building2, ShieldCheck, Target, Award, FileText, Scale, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const About = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212] min-h-screen text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">About Company</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg shadow-primary-500/30">
            <Building2 size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Earning One</h2>
          <p className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-4">Investment & Earning Platform</p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm max-w-2xl mx-auto">
            Earning One is a digital investment platform that provides users with opportunities to earn through various investment plans and daily activities. Our platform offers a secure and user-friendly environment for managing investments and tracking earnings.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-500">
              <Target size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Our Mission</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Our mission is to provide a transparent, secure, and accessible investment platform that empowers users to grow their wealth through carefully designed investment plans. We strive to deliver excellent service, maintain high security standards, and create a supportive community for our investors.
          </p>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500">
              <Award size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Why Choose Us</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure platform with advanced encryption and security measures</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Multiple investment plans to suit different risk appetites</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily earning opportunities through check-in and watch & earn features</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transparent earnings tracking and withdrawal system</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Responsive customer support through Telegram</p>
            </div>
          </div>
        </div>

        {/* Platform Services */}
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
              <Building2 size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Platform Services</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Investment plans with varying returns and durations</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily check-in rewards for active users</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Watch & earn feature for additional income opportunities</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Referral program for team building and bonus earnings</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure wallet system for deposits and withdrawals</p>
            </div>
          </div>
        </div>

        {/* Privacy Policy Summary */}
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-500">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Privacy Policy Summary</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            We are committed to protecting your privacy. Your personal information is collected only for account management and service delivery purposes. We implement industry-standard security measures to safeguard your data. We do not sell or share your personal information with third parties without your consent, except as required by law.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            For detailed privacy information, please contact our support team.
          </p>
        </div>

        {/* Terms & Conditions Summary */}
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-500">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Terms & Conditions Summary</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            By using Earning One, you agree to our terms of service. Users must be of legal age to participate in investment activities. All investments carry inherent risks, and past performance does not guarantee future results. We reserve the right to modify terms and conditions with prior notice. Users are responsible for maintaining the security of their account credentials.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Full terms and conditions are available upon request.
          </p>
        </div>

        {/* Investment Risk Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-500/20 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
              <Scale size={20} />
            </div>
            <h3 className="font-bold text-amber-900 dark:text-amber-400 text-lg">Investment Risk Disclaimer</h3>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
            <strong>Important:</strong> All investments involve risk, including the possible loss of principal. The value of investments can fluctuate, and past performance is not indicative of future results. Earning One does not guarantee any specific returns or profits. Users should carefully consider their financial situation and risk tolerance before investing. Only invest funds that you can afford to lose. We recommend consulting with a qualified financial advisor before making investment decisions.
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Please invest responsibly and understand the risks involved.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-500">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Contact Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Support available through Telegram</p>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Digital Platform - Online Services</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs text-gray-400 font-medium">Version 1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">&copy; 2024 Earning One. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
