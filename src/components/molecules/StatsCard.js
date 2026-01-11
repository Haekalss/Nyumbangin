import Card from '../atoms/Card';

export default function StatsCard({ title, value, icon, color = 'blue' }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div>
        <p className="text-[#b8a492] text-lg font-bold">{title}</p>
        <p className="text-[#b8a492] text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}
