// Membuat latar halaman transparan agar widget overlay menyatu
// di OBS, TikTok LIVE Studio, dll (Browser Source).
export default function OverlayTransparent({ children }) {
  return (
    <>
      <style>{`html, body { background: transparent !important; background-color: transparent !important; }`}</style>
      {children}
    </>
  );
}

