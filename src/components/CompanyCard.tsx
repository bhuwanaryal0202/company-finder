import Link from 'next/link'
import { Company } from '@/lib/types'
import { Building2, MapPin, Calendar } from 'lucide-react'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': 
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Link href={`/company/${company.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200" suppressHydrationWarning>
        <div className="flex justify-between items-start mb-3" suppressHydrationWarning>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {company.register_name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
            {company.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600" suppressHydrationWarning>
          {company.business_name && (
            <div className="flex items-center" suppressHydrationWarning>
              <Building2 className="w-4 h-4 mr-2" />
              <span>{company.business_name}</span>
            </div>
          )}

          {company.state && (
            <div className="flex items-center" suppressHydrationWarning>
              <MapPin className="w-4 h-4 mr-2" />
              <span>{company.state}</span>
            </div>
          )}

          {company.registration_date && (
            <div className="flex items-center" suppressHydrationWarning>
              <Calendar className="w-4 h-4 mr-2" />
              <span>Registered: {new Date(company.registration_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {company.abn && (
          <div className="mt-3 pt-3 border-t border-gray-200" suppressHydrationWarning>
            <span className="text-xs text-gray-500">ABN: {company.abn}</span>
          </div>
        )}
      </div>
    </Link>
  )
} 