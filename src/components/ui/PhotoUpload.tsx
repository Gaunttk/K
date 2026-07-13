import { useRef, useEffect } from 'react'
import { compressForUpload, formatBytes } from '../../lib/imageCompression'
import type { PhotoFormItem } from '../../types'

interface Props {
  item: PhotoFormItem
  onChange: (item: PhotoFormItem) => void
}

export default function PhotoUpload({ item, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  async function handleFile(file: File) {
    const preview = URL.createObjectURL(file)
    previewRef.current = preview
    onChange({ ...item, file, preview, uploadState: 'compressing', compressedFile: null })

    try {
      const compressed = await compressForUpload(file)
      onChange({ ...item, file, compressedFile: compressed, preview, uploadState: 'ready' })
    } catch {
      onChange({ ...item, file, preview, uploadState: 'error', compressedFile: null })
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  function handleRemove() {
    if (item.preview) URL.revokeObjectURL(item.preview)
    previewRef.current = null
    onChange({ ...item, file: null, compressedFile: null, preview: null, uploadState: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  const isEmpty = !item.file && item.uploadState === 'idle'

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-heading text-text-muted tracking-wider">{item.label}</div>

      {isEmpty ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 h-36 rounded-lg border-2 border-dashed border-border hover:border-amber transition-colors text-text-muted hover:text-text"
        >
          <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
          <span className="text-sm">Tap to add photo</span>
        </button>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border">
          {item.preview && (
            <img
              src={item.preview}
              alt={item.label}
              className="w-full h-36 object-cover"
            />
          )}
          {item.uploadState === 'compressing' && (
            <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
              <span className="text-sm text-amber">Compressing...</span>
            </div>
          )}
          {item.uploadState === 'uploading' && (
            <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
              <span className="text-sm text-amber">Uploading...</span>
            </div>
          )}
          {item.uploadState === 'done' && (
            <div className="absolute top-2 right-2 bg-amber rounded-full w-6 h-6 flex items-center justify-center">
              <svg width={14} height={14} fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 left-2 bg-bg/80 rounded-full w-7 h-7 flex items-center justify-center text-text hover:text-error transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {item.compressedFile && item.file && (
        <div className="text-xs text-text-muted">
          {formatBytes(item.file.size)} → {formatBytes(item.compressedFile.size)} · WebP
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="sr-only"
      />
    </div>
  )
}
