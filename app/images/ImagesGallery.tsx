'use client'

import { useState } from 'react'

type ImageRow = {
  url: string
  name: string
  uploadedAt: string
}

export default function ImagesGallery({ images }: { images: ImageRow[] }) {
  const [selected, setSelected] = useState<ImageRow | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <button
            type="button"
            key={`${image.url}-${index}`}
            onClick={() => setSelected(image)}
            className="overflow-hidden rounded-2xl border border-tera-border bg-tera-elevated text-left transition hover:brightness-105"
          >
            <img src={image.url} alt={image.name} className="h-44 w-full object-cover" />
            <div className="space-y-1 px-4 py-3">
              <p className="truncate text-sm font-medium text-tera-primary">{image.name}</p>
              <p className="text-xs text-tera-secondary">Uploaded {new Date(image.uploadedAt).toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-tera-border bg-tera-panel" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-tera-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-tera-primary">{selected.name}</p>
                <p className="text-xs text-tera-secondary">Uploaded {new Date(selected.uploadedAt).toLocaleString()}</p>
              </div>
              <button type="button" className="rounded-lg px-2 py-1 text-sm text-tera-secondary hover:bg-tera-highlight hover:text-tera-primary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto bg-black/20 p-3">
              <img src={selected.url} alt={selected.name} className="mx-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
