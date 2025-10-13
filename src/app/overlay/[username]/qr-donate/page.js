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
      const url = `${window.location.origin}/donate/${username}`;
      setDonateUrl(url);
    }
  }, [username]);

  if (!donateUrl) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      {/* QR Code dengan border saja - minimalis untuk overlay */}
      <div className="bg-white p-2 rounded-xl border-4 border-[#b8a492] shadow-2xl">
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
    </div>
  );
}
