import Image from 'next/image'

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505]">
            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <div className="animate-pulse">
                    <Image
                        src="/images/tera-logo.png"
                        alt="Tera"
                        width={200}
                        height={67}
                        priority
                        className="object-contain"
                    />
                </div>

                {/* Loading spinner */}
                <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-tera-neon animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-3 w-3 rounded-full bg-tera-neon animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-3 w-3 rounded-full bg-tera-neon animate-bounce"></div>
                </div>
            </div>
        </div>
    )
}
