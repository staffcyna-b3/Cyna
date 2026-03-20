import { useEffect } from "react";
import CatalogProvider from "../../providers/CatalogProvider";
import useCatalogFetch from "../../hooks/useCatalogFetch";

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
        <div style={{ padding: 16 }}>
            <h2>Catalog List</h2>

            <div style={{ marginBottom: 12 }}>
                <button onClick={() => void fetchCatalog()} disabled={loading}>
                    Refresh
                </button>
            </div>

            {loading && <div>Loading…</div>}
            {error && <div style={{ color: "red" }}>Error: {error}</div>}

            {!loading && data && (
                <div>
                    <div style={{ marginBottom: 8 }}>
                        Showing {data.rows?.length ?? 0} / {data.count ?? 0} products
                    </div>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {(data.rows ?? []).map((p) => (
                            <li key={p.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                <div style={{ color: "#555" }}>{p.description}</div>
                                <div style={{ marginTop: 6 }}>
                                    <span style={{ fontWeight: 700 }}>{p.price} €</span>
                                    <span style={{ marginLeft: 12, color: p.stock > 0 ? "green" : "#999" }}>
                                        {p.stock > 0 ? `In stock (${p.stock})` : "Out of stock"}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}