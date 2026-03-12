'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { fetchUploadedImages } from '@/app/actions/user'

type UploadedImage = {
  name: string
  url: string
  uploadedAt: string
}

export default function ImagesPage() {
  const { user, userReady } = useAuth()
  const router = useRouter()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userReady) return
    if (!user?.id) {
      router.push('/auth/signin')
      return
    }

    const loadImages = async () => {
      setLoading(true)
      const uploaded = await fetchUploadedImages(user.id)
      setImages(uploaded)
      setLoading(false)
    }

    loadImages()
  }, [userReady, user?.id, router])

  if (loading) {
    return <div className="tera-page flex items-center justify-center text-sm text-tera-secondary">Loading uploaded images...</div>
  }

  return (
    <div className="tera-page px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-semibold text-tera-primary">Uploaded Images</h1>
        <p className="mt-2 text-sm text-tera-secondary">View all images you uploaded and when each was added.</p>

        {images.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-tera-border bg-tera-panel/80 p-6 text-sm text-tera-secondary">
            No uploaded images yet.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div key={image.url} className="overflow-hidden rounded-2xl border border-tera-border bg-tera-panel/85">
                <div className="relative aspect-square w-full bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-tera-primary">{image.name}</p>
                  <p className="mt-1 text-xs text-tera-secondary">
                    Uploaded {new Date(image.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
