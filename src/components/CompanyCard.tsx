import Link from 'next/link'
import { Company } from '@/lib/types'
import { MapPin, Calendar, Building } from 'lucide-react'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': 
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Link href={`/company/${company.id}`} className="h-full block">
      <div 
        className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow h-full flex flex-col border border-gray-200" 
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-grow">
            {company.business_name}
          </h3>
          {company.status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)} inline-block whitespace-nowrap`}>
              {company.status}
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-gray-600 flex-grow">
          {company.industry && (
            <div className="flex items-center">
              <Building className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{company.industry}</span>
            </div>
          )}

          {company.state && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{company.state}</span>
            </div>
          )}

          {company.registration_date && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Registered: {new Date(company.registration_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {company.abn && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-right">
            <span className="text-xs text-gray-500">ABN: {company.abn}</span>
          </div>
        )}
      </div>
    </Link>
  )
} 