export const Checkout = () => {
    return (
        <div className="py-20 px-40">
            <div className="flex justify-between mb-10">
                <p className="text-5xl">Panier</p>
                <div>
                    <p className="text-lg">Total de 3 items</p>
                    <p className="text-primary">Continuer vos achats</p>
                </div>
            </div>

            <div className="flex justify-between gap-8">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex bg-muted/80 p-2 rounded-lg">
                        <div className="rounded-lg border">
                            image
                        </div>
                        <div>
                            <p>product name</p>
                            <p>product price</p>
                            <div className="bg-muted">
                                <button className="px-4 py-2 rounded-lg">-</button>
                                <span className="mx-2">1</span>
                                <button className="px-4 py-2 rounded-lg">+</button>
                            </div>
                            <p>Total: $19.99</p>
                        </div>
                    </div>
                    <div className="flex bg-muted/80 p-2 rounded-lg">
                        <div className="rounded-lg border">
                            image
                        </div>
                        <div>
                            <p>product name</p>
                            <p>product price</p>
                            <div className="bg-muted">
                                <button className="px-4 py-2 rounded-lg">-</button>
                                <span className="mx-2">1</span>
                                <button className="px-4 py-2 rounded-lg">+</button>
                            </div>
                            <p>Total: $19.99</p>
                        </div>
                    </div>
                </div>

                <div className="bg-black rounded-lg py-4 px-6 h-fit gap-4 flex flex-col items-end">
                    <p className="text-white">Total</p>
                    <p className="text-white">$39.98</p>
                    <button className="px-4 py-2 rounded-lg bg-primary text-white">Checkout</button>
                </div>
            </div>

            
        </div>
    )
}