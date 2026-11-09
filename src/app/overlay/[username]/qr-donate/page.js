'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function QRDonateOverlay() {
  const params = useParams();
  const username = params.username;
  const [donateUrl, setDonateUrl] = useState('');

  useEffect(() => {
    if (username) {
      const url = `${window.location.origin}/${username}`;
      setDonateUrl(url);
    }
  }, [username]);

  if (!donateUrl) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 font-sans">
      <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-3 shadow-[6px_6px_0px_#2d2d2d]">
        <div className="rounded-xl border-2 border-[#2d2d2d] bg-white p-2">
          <QRCodeSVG 
            value={donateUrl}
            size={250}
            level="H"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#2d2d2d"
            imageSettings={{
              src: "/Logo2.png",
              x: undefined,
              y: undefined,
              height: 100,
              width: 100,
              excavate: false,
            }}
          />
        </div>
        <span className="rounded-lg border-2 border-[#2d2d2d] bg-[#f2e4d4] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d]">
          Scan untuk donasi
        </span>
      </div>
    </div>
  );
}
