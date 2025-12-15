export default function AdminSidebar({ activeSection, setActiveSection, onLogout }) {
  return (
    <aside className="w-72 h-screen bg-[#2d2d2d] border-r-4 border-[#b8a492] flex flex-col justify-between py-6 px-4 fixed left-0 top-0 z-40">
      <div>
        {/* Logo and Brand */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <img src="/logo.png" alt="Nyumbangin Logo" className="w-16 h-16" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#b8a492] tracking-wide leading-tight">
              Nyumbangin
            </h1>
            <span className="bg-[#b8a492] text-[#2d2d2d] px-3 py-1 rounded-full font-bold text-xs mt-2 inline-block">
              ADMIN PANEL
            </span>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex flex-col gap-3">
          <button
            className={`text-left text-base font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeSection === 'dashboard' 
                ? 'bg-[#b8a492] text-[#2d2d2d] shadow-lg' 
                : 'text-[#b8a492] hover:text-[#d6c6b9] hover:bg-[#b8a492]/10'
            }`}
            onClick={() => setActiveSection('dashboard')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            Dashboard
          </button>
          <button
            className={`text-left text-base font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeSection === 'creator' 
                ? 'bg-[#b8a492] text-[#2d2d2d] shadow-lg' 
                : 'text-[#b8a492] hover:text-[#d6c6b9] hover:bg-[#b8a492]/10'
            }`}
            onClick={() => setActiveSection('creator')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 16a7 7 0 00-7-7v7h7zM20 9a7 7 0 00-7 7h7V9z"/>
            </svg>
            Creator
          </button>          <button
            className={`text-left text-base font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeSection === 'payout' 
                ? 'bg-[#b8a492] text-[#2d2d2d] shadow-lg' 
                : 'text-[#b8a492] hover:text-[#d6c6b9] hover:bg-[#b8a492]/10'
            }`}
            onClick={() => setActiveSection('payout')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            Payout
          </button>
          <button
            className={`text-left text-base font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeSection === 'feedback' 
                ? 'bg-[#b8a492] text-[#2d2d2d] shadow-lg' 
                : 'text-[#b8a492] hover:text-[#d6c6b9] hover:bg-[#b8a492]/10'
            }`}
            onClick={() => setActiveSection('feedback')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
            </svg>
            Feedback
          </button>
        </nav>
      </div>
      
      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="bg-red-600 text-white px-4 py-3 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 transition-all flex items-center justify-center gap-2 w-full"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
        </svg>
        Logout
      </button>
    </aside>
  );
}
