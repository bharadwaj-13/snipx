import React from 'react'

export default function Logo({ size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <path 
        d="M4 10 A 6 6 0 0 1 10 4 L 27 4 L 4 27 Z" 
        fill="currentColor" 
      />
      <path 
        d="M28 22 A 6 6 0 0 1 22 28 L 5 28 L 28 5 Z" 
        fill="currentColor" 
        style={{ opacity: 0.8 }}
      />
    </svg>
  )
}
