"use client";

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({ 
  value, 
  decimals = 0, 
  prefix = "", 
  suffix = "", 
  className = "" 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);

  useEffect(() => {
    const animationDuration = 500; // ms
    const steps = 20;
    const stepDuration = animationDuration / steps;
    const difference = value - displayValue;
    const increment = difference / steps;

    // Determine if value is increasing or decreasing
    if (difference > 0) {
      setIsIncreasing(true);
    } else if (difference < 0) {
      setIsIncreasing(false);
    }

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep === steps) {
        setDisplayValue(value);
        clearInterval(timer);
        // Reset animation state after a delay
        setTimeout(() => setIsIncreasing(null), 500);
      } else {
        setDisplayValue(prev => prev + increment);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span 
      className={`transition-all duration-500 ${className} ${
        isIncreasing === true ? 'text-green-600 scale-105' : 
        isIncreasing === false ? 'text-red-600 scale-95' : ''
      }`}
    >
      {prefix}{formattedValue}{suffix}
    </span>
  );
}