import { useEffect, useMemo, useState } from "react"
import { ArrowRight, ArrowUpRight, ShieldCheck, Zap, Globe, Lock } from "lucide-react"
import { Link } from "react-router-dom"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { GetCategories } from "@/hooks/getCategories"
import type { Category } from "@/types/interfaces/category/Category"
import type { CatalogResponse } from "@/types/interfaces/catalog/CatalogResponse"
import { ProductStatus } from "@/types/enums/product/ProductStatus"
import { CatalogService } from "@/services/CatalogService"
import { Typography } from "@/components/ui/typography"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/utils/currencyFormatter"
import placeholder from "@/assets/pictures/placeholder.svg"

const SLIDE_PALETTE = [
    { icon: ShieldCheck, accent: "#372CCA" },
    { icon: Zap,         accent: "#5B3FE8" },
    { icon: Globe,       accent: "#2D24A8" },
    { icon: Lock,        accent: "#1d155f" },
]

export default function HomePage() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const { data: categories, loading, listCategories } = GetCategories()
    const { t } = useTranslation()
    const service = useMemo(() => CatalogService.getInstance(), [])
    const [topProducts, setTopProducts] = useState<CatalogResponse[]>([])

    useEffect(() => {
        listCategories()
    }, [listCategories])

    useEffect(() => {
        service.getCatalogList({ limit: 3 }).then(res => {
            const shuffled = [...res.rows].sort(() => Math.random() - 0.5)
            setTopProducts(shuffled.slice(0, 3))
        })
    }, [service])

    useEffect(() => {
        if (!api) return
        setCurrent(api.selectedScrollSnap())
        api.on("select", () => setCurrent(api.selectedScrollSnap()))
    }, [api])

    const slides: Category[] = (categories ?? []).filter(c => c.type === 'product')
    const services: Category[] = (categories ?? []).filter(c => c.type === 'service')

    return (
        <div className="min-h-screen bg-white">
            <section className="relative" style={{ background: 'linear-gradient(to right, #0B0925 0%, #29228B 33%, #0B0925 66%, #0B0925 100%)' }}>
                <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
                    <CarouselContent>
                        {loading ? (
                            <CarouselItem>
                                <div className="flex min-h-130 items-center justify-center lg:min-h-150">
                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                                </div>
                            </CarouselItem>
                        ) : (
                            slides.map((category, index) => {
                                const { icon: Icon } = SLIDE_PALETTE[index % SLIDE_PALETTE.length]
                                return (
                                    <CarouselItem key={category.id}>
                                        <div className="relative flex min-h-130 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center sm:px-12 lg:min-h-150 lg:px-24">
                                            <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
                                                {/* Tag */}
                                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
                                                    <Icon size={14} />
                                                    {category.name}
                                                </span>

                                                {/* Title */}
                                                <h1 className="font-space-grotesk text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                                    {category.name}
                                                </h1>

                                                {/* Description */}
                                                <p className="max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                                                    {category.description}
                                                </p>

                                                {/* CTA */}
                                                <Link
                                                    to={`/catalog?categoryId=${category.id}`}
                                                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#372CCA] shadow-lg transition hover:bg-white/90 hover:shadow-xl"
                                                >
                                                    {t('home.discover')}
                                                    <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                )
                            })
                        )}
                    </CarouselContent>

                    {/* Navigation arrows */}
                    <CarouselPrevious className="left-4 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:left-8" />
                    <CarouselNext className="right-4 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:right-8" />

                    {/* Dot indicators */}
                    {!loading && (
                        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => api?.scrollTo(i)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        i === current ? "w-6 bg-white" : "w-2 bg-white/40"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </Carousel>
            </section>

            <div className="h-18 w-full bg-white"></div>

            <div style={{ background: 'radial-gradient(circle, #1A164B 0%, #0E0B37 37%, #04021D 63%, #000005 100%)' }}>

                {/* Services section */}
                <section className="relative py-16 w-full overflow-hidden">
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-96"
                    />
                    <div className="relative mx-auto w-[65%]">
                        <Typography variant='h2' className="mb-8 text-2xl font-bold text-white">
                            {t('home.services')}
                        </Typography>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {services.map((service, index) => {
                                const { icon: Icon } = SLIDE_PALETTE[index % SLIDE_PALETTE.length]
                                return (
                                    <Link
                                        key={service.id}
                                        to={`/catalog?categoryId=${service.id}`}
                                        className="group flex flex-col justify-between rounded-2xl p-5 transition min-h-52"
                                        style={{ background: 'radial-gradient(circle at 15% 15%, #1e1a48 0%, #080618 65%)' }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="text-sm font-mono text-white/40">
                                                [ <Icon className="inline" size={12} /> ]
                                            </span>
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#372CCA] text-white transition group-hover:bg-[#4f3fe8]">
                                                <ArrowUpRight size={16} />
                                            </span>
                                        </div>
                                        <div className="mt-8">
                                            <Typography variant='h3' className="text-base font-bold text-white">
                                                {service.name}
                                            </Typography>
                                            <p className="mt-1.5 line-clamp-2 text-sm text-white/50">
                                                {service.description}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Top products section */}
                {topProducts.length > 0 && (
                    <section className="px-6 py-16 sm:px-12 lg:px-24">
                        <div className="mx-auto w-[65%]">
                            <Typography variant="h2" className="mb-8 text-2xl font-bold text-white">
                                {t('home.topProducts')}
                            </Typography>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {topProducts.map((product) => {
                                    const isAvailable = product.status === ProductStatus.AVAILABLE
                                    const image = product.images?.[0]?.base64 ?? placeholder
                                    return (
                                        <Link
                                            key={product.id}
                                            to={`/catalog/${product.id}`}
                                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b25] transition hover:border-white/20"
                                            style={{ background: 'radial-gradient(circle at 15% 15%, #1e1a48 0%, #080618 65%)' }}
                                        >

                                            {/* Status badge */}
                                            <div className="relative p-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    isAvailable
                                                        ? 'bg-emerald-500/15 text-emerald-400'
                                                        : 'bg-white/10 text-white/40'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-white/40'}`} />
                                                    {isAvailable ? t('product.available') : t('product.unavailable')}
                                                </span>
                                            </div>

                                            {/* Image */}
                                            <div className="relative mx-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                                                <img
                                                    src={image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="relative p-4">
                                                <p className="font-bold text-white">{product.name}</p>
                                                <p className="mt-1 line-clamp-2 text-sm text-white/50">{product.description}</p>
                                                <p className="mt-3 text-lg font-black text-white">{formatCurrency(product.price)}</p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
