"use client"

import { AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Props = {
  accept?: string
  maxSizeMB?: number
  value?: File | null
  previewUrl?: string | null
  onChange: (file: File | null, previewUrl: string | null) => void
  disabled?: boolean
  onRemove?: () => void
}

export function FileUploadNice({
  accept = "image/*",
  maxSizeMB = 2,
  value,
  previewUrl,
  onChange,
  disabled,
  onRemove
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const activePreview = previewUrl ?? null
  const file = value ?? null

  const hasPreviewArea = !!(file || activePreview)
  const shouldShowDropzone = !hasPreviewArea
  const shouldShowProgress = !!file

  const handleOpen = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const resetState = () => {
    setProgress(0)
    setError(null)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const ext = useMemo(() => {
    if (!file) return previewUrl ? previewUrl.split(".").pop()?.split("?")[0] ?? "" : ""
    const parts = file.name.split(".")
    return parts.length > 1 ? parts.pop()!.toLowerCase() : ""
  }, [file, previewUrl])

  const fileName = useMemo(() => {
    if (file) return file.name.replace(/\.[^/.]+$/, "")
    if (previewUrl) return "logo"
    return ""
  }, [file, previewUrl])

  const validateAndSet = useCallback((f: File) => {
    resetState()
    const maxBytes = maxSizeMB * 1024 * 1024
    if (f.size > maxBytes) {
      setError(`Arquivo excede ${maxSizeMB}MB.`)
      onChange(null, null)
      return
    }

    setProgress(0)
    const url = URL.createObjectURL(f)
    onChange(f, url)

    requestAnimationFrame(() => { setTimeout(() => setProgress(100), 150) })
  }, [maxSizeMB, onChange])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    validateAndSet(f)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (disabled) return
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    validateAndSet(f)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    setDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleReload = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleRemove = () => {
    if (disabled) return
    onChange(null, null)
    onRemove?.()
    resetState()
  }

  useEffect(() => {
    if (activePreview && !file) {
      setError(null)
      setProgress(100)
    }
  }, [activePreview, file])

  return (
    <>
      {hasPreviewArea && (
        <div className="p-3 space-y-2 rounded-lg border border-dashed border-surface bg-light">
          <div className="w-full flex items-center justify-between">
            {activePreview && (
              <>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0 size-9.5 overflow-hidden rounded-full border border-surface">
                    <Image src={activePreview} alt="Preview" className="object-contain p-1" sizes="40px" fill />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{fileName}{ext && `.${ext}`}</p>
                  {file && (<p className="text-xs text-gray-500">{formatSize(file.size)}</p>)}
                  {error && (<p className="text-xs text-accent">{error}</p>)}
                  {error && (<AlertCircle className="inline-flex text-accent size-4" />)}
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleReload} className="text-gray-500" aria-label="Selecionar outro arquivo">
                    <RefreshCw className="size-4" />
                  </button>
                  <button type="button" onClick={handleRemove} className="text-gray-500" aria-label="Remover arquivo">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {shouldShowProgress && (
            <div className="flex items-center gap-2">
              <div className="flex w-full h-2 rounded-full overflow-hidden bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div className={`transition-all duration-500 ${error ? "bg-accent" : progress === 100 && "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-end text-gray-800">{progress}%</span>
            </div>
          )}
        </div>
      )}

      {shouldShowDropzone && (
        <div
          className={`p-3 flex justify-center border border-dashed rounded-lg cursor-pointer ${disabled && "opacity-50 pointer-events-none"}
          ${dragOver ? "border-accent bg-accent-light/50" : "border-surface"}`}
          onClick={handleOpen}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <div className="flex flex-col items-center">
            <span className="inline-flex justify-center items-center size-14">
              <svg className="w-14 h-auto" width="71" height="51" viewBox="0 0 71 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" strokeWidth="2" className="stroke-accent" d="M6.55172 8.74547L17.7131 6.88524V40.7377L12.8018 41.7717C9.51306 42.464 6.29705 40.3203 5.67081 37.0184L1.64319 15.7818C1.01599 12.4748 3.23148 9.29884 6.55172 8.74547Z" />
                <path stroke="currentColor" strokeWidth="2" className="stroke-accent" d="M64.4483 8.74547L53.2869 6.88524V40.7377L58.1982 41.7717C61.4869 42.464 64.703 40.3203 65.3292 37.0184L69.3568 15.7818C69.984 12.4748 67.7685 9.29884 64.4483 8.74547Z" />
                <rect stroke="currentColor" strokeWidth="2" className="stroke-accent" x="17.5656" y="1" width="35.8689" height="42.7541" rx="5" />
                <path stroke="currentColor" strokeWidth="2" className="stroke-accent fill-accent-light" fill="currentColor" d="M39.4826 33.0893C40.2331 33.9529 41.5385 34.0028 42.3537 33.2426L42.5099 33.0796L47.7453 26.976L53.4347 33.0981V38.7544C53.4346 41.5156 51.1959 43.7542 48.4347 43.7544H22.5656C19.8043 43.7544 17.5657 41.5157 17.5656 38.7544V35.2934L29.9728 22.145L39.4826 33.0893Z" />
                <circle cx="40.0902" cy="14.3443" r="4.16393" className="stroke-accent fill-accent-light" fill="currentColor" stroke="currentColor" strokeWidth="2"></circle>
              </svg>
            </span>

            <span className="text-sm text-gray-600">Solte o arquivo aqui ou procurar</span>

            <p className="text-xs text-gray-400">Tamanho máximo: {maxSizeMB}MB.</p>
          </div>

          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onInputChange} disabled={disabled} />
        </div>
      )}
    </>
  )
}