import React from 'react';
import { Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left branding */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-200">CivicAI</span>
            <span className="text-xs text-slate-500">— Civic Issue Reporting & Routing</span>
          </div>

          {/* Center info */}
          <p className="text-xs text-slate-500 text-center md:text-left">
            Empowering communities through smart infrastructure management & rapid issue routing.
          </p>

          {/* Right copyright */}
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>MVP Step 1 Foundation</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} CivicAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
