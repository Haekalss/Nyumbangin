export default function StatsCard({ title, value, icon, color = 'blue' }) {

   return (
    <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-5 flex items-center gap-4">
      <div>
        <p className="text-[#b8a492] text-lg font-bold">{title}</p>
        <p className="text-[#b8a492] text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};
