import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ClipboardList, CreditCard, LogOut, Mail, Search, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { CatalogService } from '@/services/CatalogService';
import { ProductSuggestion } from '@/types/interfaces/catalog/ProductSuggestion';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currencyFormatter';
import { Button } from '@/components/ui/button';
import placeholder from '@/assets/pictures/placeholder.svg';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentLanguage, availableLanguages, setLanguage } = useLanguage();
    const { logout, isAuthenticated, user } = useAuth();
    const { items } = useCart();
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const service = useMemo(() => CatalogService.getInstance(), []);
    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const cartContainerRef = useRef<HTMLDivElement | null>(null);
    const userContainerRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();

    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    useEffect(() => {
        const trimmedSearch = search.trim();

        if (trimmedSearch.length < 2) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            setIsLoading(false);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                setIsLoading(true);
                const result = await service.getProductSuggestions(trimmedSearch);
                setSuggestions(result);
                setIsSuggestionsOpen(true);
            } catch {
                setSuggestions([]);
                setIsSuggestionsOpen(false);
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [search, service]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!searchContainerRef.current?.contains(event.target as Node)) {
                setIsSuggestionsOpen(false);
            }
            if (!cartContainerRef.current?.contains(event.target as Node)) {
                setIsCartOpen(false);
            }
            if (!userContainerRef.current?.contains(event.target as Node)) {
                setIsUserOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        setIsSuggestionsOpen(false);
        setIsCartOpen(false);
        setIsUserOpen(false);
    }, [location.pathname]);

    const goToProduct = (slug: string) => {
        setSearch('');
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        navigate(`/catalog/${slug}`);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (suggestions.length > 0) {
            goToProduct(suggestions[0].slug);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-[#372cca] bg-white/95 backdrop-blur-md">
            <div className="relative mx-auto flex w-full max-w-[1720px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
                <div className="flex items-center justify-between gap-3">
                    <Link
                        to="/"
                        className="font-space-grotesk shrink-0 text-[2rem] font-black uppercase leading-none tracking-tight text-[#372CCA] sm:text-[2.7rem] lg:text-[3.2rem]"
                    >
                        {t('CYNA')}
                    </Link>

                    <div className="flex items-center gap-3 text-[#3d49f5] sm:gap-5 lg:min-w-[220px] lg:justify-end">
                        <div className="relative shrink-0">
                            <select
                                value={currentLanguage.code}
                                onChange={(event) => setLanguage(event.target.value)}
                                aria-label={t('language')}
                                className="appearance-none bg-transparent pr-5 text-sm font-semibold outline-none sm:text-base lg:text-lg"
                            >
                                {availableLanguages.map((language) => (
                                    <option key={language.code} value={language.code}>
                                        {language.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2" />
                        </div>

                        <div className="relative group" ref={cartContainerRef}>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => { setIsSuggestionsOpen(false); setIsCartOpen(prev => !prev); }}
                                aria-label={t('cart.title')}
                                className="relative"
                            >
                                    <ShoppingCart strokeWidth={3} />
                                    {cartCount > 0 && (
                                        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3d49f5] px-1 text-[11px] font-bold leading-none text-white">
                                            {cartCount}
                                        </span>
                                    )}
                            </Button>

                            <div className={`absolute right-0 top-full pt-3 z-50 ${isCartOpen ? 'block' : 'hidden group-hover:block'}`}>
                                <div className="w-80 rounded-2xl border border-[#e0e4f8] bg-white shadow-[0_24px_60px_rgba(32,41,102,0.18)] overflow-hidden">
                                    {items.length === 0 ? (
                                        <p className="px-5 py-6 text-center text-sm text-gray-400">{t('cart.empty')}</p>
                                    ) : (
                                        <>
                                            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                                                {items.map((item) => (
                                                    <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                                                        <img
                                                            src={item.imageUrl ?? placeholder}
                                                            alt={item.name}
                                                            className="h-12 w-12 rounded-lg object-cover shrink-0 bg-gray-100"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">{t(`products.${item.name}.name`)}</p>
                                                            <p className="text-xs text-gray-500 flex items-baseline gap-1">
                                                                {item.quantity} ×{' '}
                                                                {item.discountedUnitPrice !== undefined && (
                                                                    <span className="line-through text-gray-400">{formatCurrency(item.unitPrice)}</span>
                                                                )}
                                                                <span className={item.discountedUnitPrice !== undefined ? 'text-red-500 font-semibold' : ''}>
                                                                    {formatCurrency(item.discountedUnitPrice ?? item.unitPrice)}
                                                                </span>
                                                                {item.isService && item.period ? <> {t('perMonthSuffix')}</> : null}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm font-bold text-[#3d49f5] shrink-0">
                                                            {formatCurrency((item.discountedUnitPrice ?? item.unitPrice) * item.quantity)}
                                                            {item.isService && item.period ? <span className="text-xs font-normal text-gray-400"> / mois</span> : null}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="border-t border-gray-100 px-4 py-3 flex justify-center">
                                                <Link
                                                    to="/cart"
                                                >
                                                    {t('cart.seeCart')}
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative group" ref={userContainerRef}>
                            <Button variant="ghost" size="icon" className="flex items-center justify-center gap-1.5" aria-label={t('account')} onClick={() => setIsUserOpen(prev => !prev)}>
                                <User strokeWidth={3} className="h-5 w-5 shrink-0" />
                                {isAuthenticated && (
                                    <span className="hidden sm:block text-xs font-semibold max-w-20 truncate">
                                        {user?.full_name.split(' ')[0]}
                                    </span>
                                )}
                            </Button>

                            <div className={`absolute right-0 top-full pt-3 z-50 ${isUserOpen ? 'block' : 'hidden group-hover:block'}`}>
                                <div className="w-56 rounded-2xl border border-[#e0e4f8] bg-white shadow-[0_24px_60px_rgba(32,41,102,0.18)] overflow-hidden">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="px-4 py-3 flex justify-center">
                                                <Link to="/account" className="flex items-center gap-2 text-sm text-[#3d49f5]">
                                                    <User className="h-4 w-4" strokeWidth={2} />
                                                    {t('account.myAccount')}
                                                </Link>
                                            </div>
                                            <div className="border-t border-[#e0e4f8] px-4 py-3 flex justify-center">
                                                <Link to="/my-orders" className="flex items-center gap-2 text-sm text-[#3d49f5]">
                                                    <ClipboardList className="h-4 w-4" strokeWidth={2} />
                                                    {t('orders.myOrders')}
                                                </Link>
                                            </div>
                                            <div className="border-t border-[#e0e4f8] px-4 py-3 flex justify-center">
                                                <Link to="/mon-compte/abonnements" className="flex items-center gap-2 text-sm text-[#3d49f5]">
                                                    <CreditCard className="h-4 w-4" strokeWidth={2} />
                                                    {t('subscriptions.pageTitle')}
                                                </Link>
                                            </div>
                                            <div className="border-t border-[#e0e4f8] px-4 py-3 flex justify-center">
                                                <Link to="/contact" className="flex items-center gap-2 text-sm text-[#3d49f5]">
                                                    <Mail className="h-4 w-4" strokeWidth={2} />
                                                    {t('contact.support')}
                                                </Link>
                                            </div>
                                            <div className="border-t border-[#e0e4f8] px-4 py-3 flex justify-center">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 text-sm text-[#3d49f5]"
                                                >
                                                    <LogOut className="h-4 w-4" strokeWidth={2} />
                                                    {t('logout')}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="px-4 py-3 flex justify-center">
                                                <Link to="/login" className="flex items-center gap-2 text-sm text-[#3d49f5]">
                                                    <User className="h-4 w-4" strokeWidth={2} />
                                                    {t('login')}
                                                </Link>
                                            </div>
                                            <div className="border-t border-[#e0e4f8] px-4 py-3 flex justify-center">
                                                <Link to="/register" className="flex items-center gap-2 text-sm text-[#3d49f5]">
                                                    {t('register')}
                                                </Link>
                                            </div>
                                            <div className="border-t border-[#e0e4f8] px-4 py-3 flex justify-center">
                                                <Link to="/contact" className="flex items-center gap-2 text-sm text-[#3d49f5]">
                                                    <Mail className="h-4 w-4" strokeWidth={2} />
                                                    {t('contact.support')}
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:absolute lg:left-1/2 lg:top-1/2 lg:w-full lg:max-w-[600px] h-50px lg:-translate-x-1/2 lg:-translate-y-1/2 lg:px-8">
                    <div ref={searchContainerRef} className="relative mx-auto w-full max-w-[720px]">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0) {
                                        setIsSuggestionsOpen(true);
                                    }
                                }}
                                type="search"
                                placeholder={t('searchProductPlaceholder')}
                                className="h-12 w-full rounded-full border-2 border-[#372cca] bg-[#1d155f] pl-5 pr-14 text-base text-white outline-none transition placeholder:text-white/78 focus:border-[#4752ff] focus:bg-[#231a72] sm:h-14 sm:pl-6 sm:pr-16 sm:text-lg"
                            />
                            <Button
                                variant='cyna'
                                size='icon'
                                aria-label={t('search')}
                                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#3d49f5] text-white shadow-[0_8px_18px_rgba(61,73,245,0.35)] transition hover:scale-105 sm:h-12 sm:w-12"
                            >
                                <Search />
                            </Button>
                        </form>

                        {isSuggestionsOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-[22px] border border-[#d8def8] bg-white shadow-[0_24px_60px_rgba(32,41,102,0.16)] sm:rounded-[26px]">
                                {isLoading ? (
                                    <div className="px-5 py-4 text-sm text-[#5f6799]">{t('searching')}</div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((suggestion) => (
                                        <Button
                                            variant="ghost"
                                            size='icon'
                                            key={suggestion.id}
                                            onClick={() => goToProduct(suggestion.slug)}
                                            className="flex w-full items-center justify-between px-5 py-4 text-left text-[#181d42] transition hover:bg-[#f3f5ff]"
                                        >
                                            <span className="font-medium">{t(`products.${suggestion.name}.name`)}</span>
                                            <ArrowRight />
                                        </Button>
                                    ))
                                ) : (
                                    <div className="px-5 py-4 text-sm text-[#5f6799]">{t('noProductFound')}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
