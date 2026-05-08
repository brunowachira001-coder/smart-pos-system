import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime?: Date;
  variant?: 'default' | 'compact' | 'large';
}

export default function CountdownTimer({ endTime, variant = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
          </div>
          <div className="text-xs mt-1">Hours</div>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
          </div>
          <div className="text-xs mt-1">Minutes</div>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          </div>
          <div className="text-xs mt-1">Seconds</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
        <div className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-xs">Hours</div>
      </div>
      <span className="text-xl">:</span>
      <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
        <div className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-xs">Mins</div>
      </div>
      <span className="text-xl">:</span>
      <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
        <div className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-xs">Secs</div>
      </div>
    </div>
  );
}
