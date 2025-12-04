import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center py-10 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>
      <h1 className="relative text-5xl md:text-6xl font-black mb-3 tracking-tight drop-shadow-2xl">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 filter drop-shadow-lg">
          מחשבון שותפים
        </span>
      </h1>
      <p className="text-slate-400/80 text-lg font-light tracking-[0.2em] uppercase">
        אלי <span className="text-cyan-500/50 mx-2">•</span> שמעון
      </p>
    </div>
  );
};

export default Header;