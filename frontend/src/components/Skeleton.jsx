import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => {
  return (
    <div 
      className={`skeleton-base ${className}`} 
      style={{ 
        display: 'block',
        width: width || '100%', 
        height: height || '20px', 
        borderRadius 
      }}
    />
  );
};

export default Skeleton;
