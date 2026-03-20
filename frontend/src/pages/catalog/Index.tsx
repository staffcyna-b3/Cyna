import { useEffect } from "react";
import CatalogProvider from "../../providers/CatalogProvider";
import useCatalogFetch from "../../hooks/useCatalogFetch";
import CatalogProductCard from "../../components/CatalogProductCard";

export default function CatalogList() {
    return (
        <CatalogProvider>
            <CatalogListInner />
        </CatalogProvider>
    );
}

function CatalogListInner() {
    const { data, loading, error, fetchCatalog } = useCatalogFetch();

    useEffect(() => {
        void fetchCatalog();
    }, [fetchCatalog]);

    return (
        <div className="p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">Tops produits du moment</h2>

            <div className="mb-4">
                <button className="btn" onClick={() => void fetchCatalog()} disabled={loading}>
                    Rafraîchir
                </button>
            </div>

            {loading && <div>Chargement…</div>}
            {error && <div className="text-red-400">Erreur: {error}</div>}

            {!loading && data && (
                <div>
                    <div className="mb-2 text-sm text-[#bfc8ff]">
                        Affichage {data.rows?.length ?? 0} / {data.count ?? 0} produits
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {(data.rows ?? []).map((p) => (
                            <CatalogProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}