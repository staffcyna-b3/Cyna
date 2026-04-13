import { useEffect, useState } from "react"
import { ArrowRight, ShieldCheck, Zap, Globe, Lock } from "lucide-react"
import { Link } from "react-router-dom"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"

const slides = [
    {
        tag: "Solution EDR",
        title: "Protection des endpoints en temps réel",
        description:
            "Détectez et neutralisez les menaces sur l'ensemble de vos postes de travail grâce à notre solution EDR pilotée par IA.",
        icon: ShieldCheck,
        cta: "Découvrir l'EDR",
        href: "/catalog?categoryId=fec8229f-194e-4f5e-a301-c07ff365a6b6",
        accent: "#372CCA",
    },
    {
        tag: "Solution XDR",
        title: "Visibilité étendue sur toute votre infrastructure",
        description:
            "Corrélation multi-sources, investigation accélérée et réponse automatisée pour une défense unifiée.",
        icon: Zap,
        cta: "Découvrir le XDR",
        href: "/catalog?categoryId=d5bbe421-1032-41c0-8c70-c3b8d2ed7bd3",
        accent: "#5B3FE8",
    },
    {
        tag: "Solution SOC",
        title: "Centre des opérations de sécurité managé",
        description:
            "Bénéficiez d'une surveillance 24/7 assurée par des experts certifiés et d'une réponse aux incidents en moins de 15 minutes.",
        icon: Globe,
        cta: "Découvrir le SOC",
        href: "/catalog?categoryId=b457941c-a53c-4fb5-b09e-feb0cec06a9e",
        accent: "#2D24A8",
    },
    {
        tag: "Solutions Cybersécurité SIEM",
        title: "Sécurisez vos environnements industriels",
        description:
            "Gestion centralisée des événements de sécurité et des informations pour protéger vos systèmes industriels contre les cybermenaces.",
        icon: Lock,
        cta: "Découvrir le SIEM",
        href: "/catalog?categoryId=c6b75642-5d80-47c4-af11-aeac55233758",
        accent: "#1d155f",
    },
]

export default function HomePage() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) return
        setCurrent(api.selectedScrollSnap())
        api.on("select", () => setCurrent(api.selectedScrollSnap()))
    }, [api])

    return (
        <div className="min-h-screen bg-white">
            {/* Hero carousel */}
            <section className="relative bg-[#1d155f]">
                <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
                    <CarouselContent>
                        {slides.map((slide, index) => {
                            const Icon = slide.icon
                            return (
                                <CarouselItem key={index}>
                                    <div className="relative flex min-h-130 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center sm:px-12 lg:min-h-150 lg:px-24">
                                        {/* Glow background */}
                                        <div
                                            className="pointer-events-none absolute inset-0 opacity-30"
                                            style={{
                                                background: `radial-gradient(ellipse 70% 60% at 50% 60%, ${slide.accent}, transparent)`,
                                            }}
                                        />

                                        <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
                                            {/* Tag */}
                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
                                                <Icon size={14} />
                                                {slide.tag}
                                            </span>

                                            {/* Title */}
                                            <h1 className="font-space-grotesk text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                                {slide.title}
                                            </h1>

                                            {/* Description */}
                                            <p className="max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                                                {slide.description}
                                            </p>

                                            {/* CTA */}
                                            <Link
                                                to={slide.href}
                                                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#372CCA] shadow-lg transition hover:bg-white/90 hover:shadow-xl"
                                            >
                                                {slide.cta}
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>

                    {/* Navigation arrows */}
                    <CarouselPrevious className="left-4 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:left-8" />
                    <CarouselNext className="right-4 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:right-8" />

                    {/* Dot indicators */}
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
                </Carousel>
            </section>
        </div>
    )
}
