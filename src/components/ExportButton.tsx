'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Get current search params from URL
      const searchParams = new URLSearchParams(window.location.search)
      
      // Create export URL with current filters
      const exportUrl = `/api/export?${searchParams.toString()}`
      
      // Create hidden link and trigger download
      const link = document.createElement('a')
      link.href = exportUrl
      link.download = 'companies.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </>
      )}
    </button>
  )
} 