import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFrontUserProfile, isFrontAuthenticated, setFrontUserProfile } from "@/lib/frontAuth"
import { LucideTrash } from "lucide-react"

const CART_STORAGE_KEY = "checkout:cart"
const LIVRAISON_COST = 4.99
const FALLBACK_PROFILE = {
    fullName: "Jean Dupont",
    address: "12 Rue de la Paix",
    city: "Paris",
    postalCode: "75002"
}

type CartItem = {
    id: number
    name: string
    price: number
    quantity: number
    image: string
}

const defaultCartItems: CartItem[] = [
    {
        id: 1,
        name: "Product 1",
        price: 19.99,
        quantity: 1,
        image: "https://i0.wp.com/citygem.app/wp-content/uploads/2024/08/placeholder-8.png?resize=600%2C400&ssl=1"
    },
    {
        id: 2,
        name: "Product 2",
        price: 19.99,
        quantity: 1,
        image: "https://i0.wp.com/citygem.app/wp-content/uploads/2024/08/placeholder-8.png?resize=600%2C400&ssl=1"
    }
]

export const Checkout = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const profile = getFrontUserProfile() || (isFrontAuthenticated() ? FALLBACK_PROFILE : null)
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY)

        if (!savedCart) {
            return defaultCartItems
        }

        try {
            return JSON.parse(savedCart) as CartItem[]
        } catch {
            return defaultCartItems
        }
    })
    const [fullName, setFullName] = useState(profile?.fullName ?? FALLBACK_PROFILE.fullName)
    const [address, setAddress] = useState(profile?.address ?? "")
    const [city, setCity] = useState(profile?.city ?? "")
    const [postalCode, setPostalCode] = useState(profile?.postalCode ?? "")
    const [billingAddress, setBillingAddress] = useState(profile?.address ?? "")
    const [billingCity, setBillingCity] = useState(profile?.city ?? "")
    const [billingPostalCode, setBillingPostalCode] = useState(profile?.postalCode ?? "")
    const [useFacturationAddress, setUseFacturationAddress] = useState(false)
    const [isEditingShippingAddress, setIsEditingShippingAddress] = useState(false)
    const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false)

    const currentStep = searchParams.get("step") === "address" ? "address" : "cart"

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    }, [cartItems])

    const totalItems = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
        [cartItems]
    )

    const cartTotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [cartItems]
    )

    const finalTotal = useMemo(
        () => cartTotal + LIVRAISON_COST,
        [cartTotal]
    )

    const shippingAddress = useFacturationAddress ? billingAddress : address
    const shippingCity = useFacturationAddress ? billingCity : city
    const shippingPostalCode = useFacturationAddress ? billingPostalCode : postalCode

    const updateQuantity = (id: number, change: number) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + change) }
                    : item
            )
        )
    }

    const removeItem = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id))
    }

    const goToAddressStep = () => {
        if (!isFrontAuthenticated()) {
            const redirectTo = encodeURIComponent("/checkout?step=address")
            navigate(`/login?redirect=${redirectTo}`)
            return
        }

        if (!getFrontUserProfile()) {
            setFrontUserProfile(FALLBACK_PROFILE)
            setAddress(FALLBACK_PROFILE.address)
            setCity(FALLBACK_PROFILE.city)
            setPostalCode(FALLBACK_PROFILE.postalCode)
        }

        setSearchParams({ step: "address" })
    }

    const goToCartStep = () => {
        setSearchParams({ step: "cart" })
    }

    return (
        <div className="py-20 px-40">
            <div className="flex justify-between mb-10">
                <p className="text-5xl">{currentStep === "cart" ? "Panier" : "Adresse de livraison"}</p>
                <div>
                    <p className="text-lg">Total de {totalItems} items</p>
                    <Link to="/" className="text-primary">Continuer vos achats</Link>
                </div>
            </div>

            <div className="flex justify-between gap-8">
                {currentStep === "cart" ? (
                    <div className="flex flex-col gap-2 flex-1">
                        {cartItems.map(item => (
                            <div className="flex bg-muted/30 p-2 rounded-lg gap-4" key={item.id}>
                                <div className="rounded-lg border max-w-72 max-h-60 w-auto overflow-hidden">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p>{item.name}</p>
                                    <p>${item.price.toFixed(2)}</p>
                                    <div className="flex gap-1">
                                        <div className="bg-muted rounded-lg">
                                            <button className="px-4 py-2 " onClick={() => updateQuantity(item.id, -1)}>-</button>
                                            <span className="mx-2">{item.quantity}</span>
                                            <button className="px-4 py-2 " onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                        <Button variant="ghost" onClick={() => removeItem(item.id)}><LucideTrash /></Button>
                                    </div>
                                    <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 flex-1">
                        <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-medium">Adresse de facturation</p>
                                <Button variant="ghost" onClick={() => setIsEditingBillingAddress(true)}>Update</Button>
                            </div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={useFacturationAddress}
                                    onChange={event => setUseFacturationAddress(event.target.checked)}
                                />
                                <span>Use facturation address for livraison</span>
                            </label>
                            {isEditingBillingAddress ? (
                                <>
                                    <Input
                                        value={fullName}
                                        onChange={event => setFullName(event.target.value)}
                                        placeholder="Nom complet"
                                    />
                                    <Input
                                        value={billingAddress}
                                        onChange={event => setBillingAddress(event.target.value)}
                                        placeholder="Adresse"
                                    />
                                    <Input
                                        value={billingCity}
                                        onChange={event => setBillingCity(event.target.value)}
                                        placeholder="Ville"
                                    />
                                    <Input
                                        value={billingPostalCode}
                                        onChange={event => setBillingPostalCode(event.target.value)}
                                        placeholder="Code postal"
                                    />
                                </>
                            ) : (
                                <>
                                    <p>{fullName || "-"}</p>
                                    <p>{billingAddress || "-"}</p>
                                    <p>{billingCity || "-"}</p>
                                    <p>{billingPostalCode || "-"}</p>
                                </>
                            )}
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-medium">Adresse de livraison</p>
                                {!useFacturationAddress && (
                                    <Button variant="ghost" onClick={() => setIsEditingShippingAddress(true)}>Update</Button>
                                )}
                            </div>
                            {useFacturationAddress ? (
                                <p>Same as facturation</p>
                            ) : isEditingShippingAddress ? (
                                <>
                                    <Input
                                        value={fullName}
                                        onChange={event => setFullName(event.target.value)}
                                        placeholder="Nom complet"
                                    />
                                    <Input
                                        value={shippingAddress}
                                        onChange={event => setAddress(event.target.value)}
                                        placeholder="Adresse"
                                    />
                                    <Input
                                        value={shippingCity}
                                        onChange={event => setCity(event.target.value)}
                                        placeholder="Ville"
                                    />
                                    <Input
                                        value={shippingPostalCode}
                                        onChange={event => setPostalCode(event.target.value)}
                                        placeholder="Code postal"
                                    />
                                </>
                            ) : (
                                <>
                                    <p>{fullName || "-"}</p>
                                    <p>{shippingAddress || "-"}</p>
                                    <p>{shippingCity || "-"}</p>
                                    <p>{shippingPostalCode || "-"}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-black rounded-lg py-4 px-6 h-fit gap-4 flex flex-col items-end">
                    <p className="text-white">Total</p>
                    {currentStep === "address" ? (
                        <>
                            <p className="text-white">Livraison: ${LIVRAISON_COST.toFixed(2)}</p>
                            <p className="text-white">${finalTotal.toFixed(2)}</p>
                        </>
                    ) : (
                        <p className="text-white">${cartTotal.toFixed(2)}</p>
                    )}
                    {currentStep === "cart" ? (
                        <button className="px-4 py-2 rounded-lg bg-primary text-white" onClick={goToAddressStep}>Continuer</button>
                    ) : (
                        <button className="px-4 py-2 rounded-lg bg-primary text-white" onClick={goToCartStep}>Retour au panier</button>
                    )}
                </div>
            </div>
        </div>
    )
}