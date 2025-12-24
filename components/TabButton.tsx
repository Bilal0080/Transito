import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 ${
        isActive
          ? 'border-accent-cyan text-accent-cyan bg-gray-800/50'
          : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};