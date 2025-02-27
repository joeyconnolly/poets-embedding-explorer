// src/components/shared/LoadingIndicator.js
import React from 'react';

const LoadingIndicator = ({ size = 'medium', color = 'indigo' }) => {
  // Size mapping
  const sizeMap = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  // Color mapping
  const colorMap = {
    indigo: 'border-indigo-500',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500'
  };
  
  const sizeClass = sizeMap[size] || sizeMap.medium;
  const colorClass = colorMap[color] || colorMap.indigo;
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClass} border-2 ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingIndicator;
