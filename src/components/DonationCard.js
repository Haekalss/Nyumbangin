export default function DonationCard({ donation }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {donation.name}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2">
            {donation.message || 'Tidak ada pesan'}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(donation.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-xl font-bold text-green-600 mb-2">
            Rp {donation.amount.toLocaleString('id-ID')}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            donation.status === 'PAID' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {donation.status === 'PAID' ? 'Lunas' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}
