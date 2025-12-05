"use client"

import React from 'react';

type Props = {
  displayLabel?: string;
};

export default function SeatProxy({ displayLabel }: Props) {
  return (
    <div
      role="button"
      aria-hidden
      className={`h-10 w-10 flex items-center justify-center text-xs font-medium rounded-md border bg-[#0b1727] border-gray-700 opacity-60 animate-pulse`}
    >
      {displayLabel ?? ''}
    </div>
  );
}
