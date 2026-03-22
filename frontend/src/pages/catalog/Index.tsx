import CatalogProvider from '../../providers/CatalogProvider';
import CatalogListInner from './ListInner';

export default function CatalogList() {
    return (
        <CatalogProvider>
            <CatalogListInner />
        </CatalogProvider>
    );
}
