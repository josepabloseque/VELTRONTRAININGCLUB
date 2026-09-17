import React, { useState } from 'react';

interface BicepsFlexedIconProps {
  size?: number;
  className?: string;
  color?: string;
  interactive?: boolean;
}

export const BicepsFlexedIcon: React.FC<BicepsFlexedIconProps> = ({
  size = 64,
  className = '',
  color = 'currentColor',
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`inline-flex items-center justify-center transition-transform duration-300 ${
        isHovered ? 'scale-110 -rotate-6' : 'scale-100 rotate-0'
      } ${className}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      style={{ color }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300 drop-shadow-[0_0_15px_rgba(181,176,78,0.3)]"
      >
        <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
        <path d="M15 14a5 5 0 0 0-7.584 2" />
        <path d="M9.964 6.825C8.019 7.977 9.5 13 8 15" />
      </svg>
    </div>
  );
};
