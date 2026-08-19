import React from 'react';
import WebsiteTruthSerumLogo from './WebsiteTruthSerumLogo';

const FullLogo = ({ size = 42, showTagline = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <WebsiteTruthSerumLogo size={size} />
      
      <div className="flex flex-col leading-tight">
        <div className="text-lg font-semibold text-slate-900">
          Website{' '}
          <span className="text-[#00FF66] font-bold">Truth</span>{' '}
          <span className="text-[#4F46E5] font-semibold">Serum</span>
        </div>
        {showTagline && (
          <div className="text-xs text-slate-400 font-normal">
            Instantly separate web truth from filler
          </div>
        )}
      </div>
    </div>
  );
};

export default FullLogo;