import Image from 'next/image'

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-tera-bg">
            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <div className="animate-pulse relative w-[200px] h-[67px]">
                    <Image
                        src="/images/TERA_LOGO_ONLY1.png"
                        alt="Tera"
                        fill
                        className="object-contain block dark:hidden"
                        priority
                    />
                    <Image
                        src="/images/TERA_LOGO_ONLY.png"
                        alt="Tera"
                        fill
                        className="object-contain hidden dark:block"
                        priority
                    />
                </div>

                {/* Loading spinner */}
                <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-tera-primary animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-3 w-3 rounded-full bg-tera-primary animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-3 w-3 rounded-full bg-tera-primary animate-bounce"></div>
                </div>
            </div>
        </div>
    )
}
