import React from 'react';

const digitPatterns = [
  [1, 1, 1, 1, 1, 1, 0], // 0
  [0, 1, 1, 0, 0, 0, 0], // 1
  [1, 1, 0, 1, 1, 0, 1], // 2
  [1, 1, 1, 1, 0, 0, 1], // 3
  [0, 1, 1, 0, 0, 1, 1], // 4
  [1, 0, 1, 1, 0, 1, 1], // 5
  [1, 0, 1, 1, 1, 1, 1], // 6
  [1, 1, 1, 0, 0, 0, 0], // 7
  [1, 1, 1, 1, 1, 1, 1], // 8
  [1, 1, 1, 1, 0, 1, 1], // 9
];

const segmentPaths = [
  'm 70,0 8,8 -8,8 H 18 L 10,8 18,0 Z', // A (top)
  'm 72,18 8,-8 8,8 v 52 l -8,8 -8,-8 z', // B (top-right)
  'm 72,90 8,-8 8,8 v 52 l -8,8 -8,-8 z', // C (bottom-right)
  'm 70,144 8,8 -8,8 H 18 L 10,152 18,144 Z', // D (bottom)
  'm 0,90 8,-8 8,8 v 52 l -8,8 -8,-8 z', // E (bottom-left)
  'm 0,18 8,-8 8,8 V 70 L 8,78 0,70 Z', // F (top-left)
  'm 70,72 8,8 -8,8 H 18 L 10,80 18,72 Z', // G (middle)
];

export interface SevenSegmentNumberProps {
  value: number;
  height?: number;
  width?: number;
  onColor?: string;
  offColor?: string;
  className?: string;
}

export const SevenSegmentNumber: React.FC<SevenSegmentNumberProps> = ({
  value,
  height = 54,
  width = 30,
  onColor = '#B5B04E',
  offColor = '#181C1A',
  className,
}) => {
  const pattern =
    value >= 0 && value <= 9 ? digitPatterns[value] : [0, 0, 0, 0, 0, 0, 0];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 88 160"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {segmentPaths.map((path, index) => (
        <path
          key={index}
          d={path}
          fill={pattern[index] === 1 ? onColor : offColor}
          className="transition-colors duration-200"
        />
      ))}
    </svg>
  );
};

export const SevenSegmentDisplay: React.FC<{
  value: number;
  minDigits?: number;
  onColor?: string;
  offColor?: string;
  digitWidth?: number;
  digitHeight?: number;
}> = ({
  value,
  minDigits = 2,
  onColor = '#B5B04E',
  offColor = '#181C1A',
  digitWidth = 26,
  digitHeight = 48,
}) => {
  const str = String(value);
  const formatted = str.length < minDigits ? str.padStart(minDigits, '0') : str;
  const digitArray = formatted.split('').map(Number);

  return (
    <div className="inline-flex items-center gap-1.5 p-2.5 bg-[#0A0C0B] rounded-xl border border-zinc-800/80 shadow-inner">
      {digitArray.map((d, i) => (
        <SevenSegmentNumber
          key={i}
          value={d}
          width={digitWidth}
          height={digitHeight}
          onColor={onColor}
          offColor={offColor}
        />
      ))}
    </div>
  );
};
