'use client'

import { useParams, useRouter } from 'next/navigation'
import { Building2, MapPin, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useCompanyDetails } from '@/lib/queries'
import { useState, useEffect } from 'react'
import { setNavigatingBack } from '@/lib/hooks'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const { data: company, isLoading, error } = useCompanyDetails(companyId)

  // Handle back navigation to preserve search state
  const handleBackNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Set the flag to indicate we're navigating back
    setNavigatingBack(true);
    
    // Try the browser's back button first
    router.back();
    
    // Fallback: if we don't navigate away within 100ms, go to home page
    setTimeout(() => {
      // Check if we're still on the same page
      if (window.location.pathname.includes(`/company/${companyId}`)) {
        // Still on the same page, force navigation to home
        window.location.href = '/';
      }
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return 'bg-green-100 text-green-800'
      case 'deregistered':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error || !company) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : error ? String(error) : 'Company not found'
      
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Company</h3>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <Link 
            href="/"
            onClick={handleBackNavigation}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            onClick={handleBackNavigation}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {company.business_name || 'Unnamed Company'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {company.state && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {company.state}
                  </span>
                )}
                {company.registration_date && (
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Registered {new Date(company.registration_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            {company.status && (
              <div className="mt-4 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                  {company.status}
                </span>
              </div>
            )}
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
              <dl className="space-y-4">
                {company.industry && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Industry</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.industry}</dd>
                  </div>
                )}
                {company.registration_number && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.registration_number}</dd>
                  </div>
                )}
                {company.abn && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ABN</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.abn}</dd>
                  </div>
                )}
                {company.acn && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ACN</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.acn}</dd>
                  </div>
                )}
                {company.business_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.business_name}</dd>
                  </div>
                )}
                {company.cancellation_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cancellation Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(company.cancellation_date).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 