'use client'

import { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import CompanyCard from '@/components/CompanyCard'
import { Company, SearchFilters } from '@/lib/types'
import { Download, Building2 } from 'lucide-react'

const ITEMS_PER_PAGE = 12

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    query: '',
    industry: 'all',
    state: 'all',
    status: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)

  const handleSearchResults = (results: Company[], total: number, filters: SearchFilters) => {
    setCompanies(results)
    setTotal(total)
    setCurrentFilters(filters)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...currentFilters,
        page: currentPage.toString()
      })
      const response = await fetch(`/api/export?${params}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'companies.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Company Finder</h1>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SearchBar onResults={handleSearchResults} onLoading={setIsLoading} />
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                  <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                </div>
              </div>
            ) : companies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {companies.map((company, index) => (
                  <CompanyCard 
                    key={`${company.abn || 'no-abn'}-${company.register_name}-${index}`} 
                    company={company} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No companies found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {Math.ceil(total / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(total / ITEMS_PER_PAGE)}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
