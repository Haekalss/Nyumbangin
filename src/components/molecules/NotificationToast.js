import React from 'react';

const NotificationToast = ({ message, detail, time, progress = 0 }) => {
  return (
    <div
      className="fixed top-6 right-6 z-50 min-w-[320px] max-w-md rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] px-5 py-4 text-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d]"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] shadow-[2px_2px_0px_#2d2d2d]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold leading-snug text-[#2d2d2d]">{message}</p>
          {detail ? (
            <p className="mt-1 text-xs font-medium leading-relaxed text-[#696057] break-words">
              Pesan: {detail}
            </p>
          ) : null}
          {time ? (
            <p className="mt-1 font-mono text-[11px] font-bold text-[#8f857b]">{time}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-[#2d2d2d]/20 bg-[#f2e4d4]">
        <div
          className="h-full rounded-full bg-[#2d2d2d] transition-[width] duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default NotificationToast;
