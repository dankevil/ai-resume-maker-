"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DocumentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  file: File | null
}

export function DocumentPreview({ file, className, ...props }: DocumentPreviewProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!file) {
      setPreview(null)
      setError(null)
      return
    }

    const generatePreview = async () => {
      try {
        // For images, create an object URL
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          setPreview(url)
          setError(null)
          return () => URL.revokeObjectURL(url)
        }

        // For PDFs, show a placeholder with file info
        if (file.type === 'application/pdf') {
          setPreview('/pdf-placeholder.svg')
          setError(null)
          return
        }

        // For unsupported types, show error
        setError('Unsupported file type')
        setPreview(null)
      } catch (error) {
        console.error('Error generating preview:', error)
        setError('Failed to generate preview')
        setPreview(null)
      }
    }

    generatePreview()
  }, [file])

  if (!file) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50",
          className
        )}
        {...props}
      >
        <div className="text-center">
          <p className="text-sm text-gray-500">No file selected</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50",
          className
        )}
        {...props}
      >
        <div className="text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-white",
        className
      )}
      {...props}
    >
      {file.type.startsWith('image/') ? (
        <img
          src={preview || ''}
          alt={file.name}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          <img
            src={preview || ''}
            alt={file.name}
            className="h-32 w-32 object-contain opacity-50"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2">
            <p className="text-sm font-medium text-center">{file.name}</p>
            <p className="text-xs text-gray-500 text-center">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 