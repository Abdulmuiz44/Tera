'use client'

import { useState } from 'react'

type ImageRow = {
  url: string
  name: string
  uploadedAt: string
}

interface ImageGalleryProps {
  images: ImageRow[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageRow | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="overflow-hidden rounded-2xl border border-tera-border bg-tera-elevated text-left transition hover:border-tera-primary/35"
          >
            <img src={image.url} alt={image.name} className="h-44 w-full object-cover" />
            <div className="space-y-1 px-4 py-3">
              <p className="truncate text-sm font-medium text-tera-primary">{image.name}</p>
              <p className="text-xs text-tera-secondary">Uploaded {new Date(image.uploadedAt).toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-tera-border bg-tera-panel shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-sm font-medium text-white transition hover:bg-black/75"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image preview"
            >
              Close
            </button>
            <img src={selectedImage.url} alt={selectedImage.name} className="max-h-[80vh] w-full bg-black object-contain" />
            <div className="border-t border-tera-border px-4 py-3">
              <p className="text-sm font-medium text-tera-primary">{selectedImage.name}</p>
              <p className="text-xs text-tera-secondary">Uploaded {new Date(selectedImage.uploadedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
