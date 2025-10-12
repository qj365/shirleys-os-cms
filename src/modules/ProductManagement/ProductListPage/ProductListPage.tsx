import AppHelmet from '@/components/AppHelmet/AppHelmet';
import ProductList from '@/features/product-management/components/ProductList';
import type { TPageInfo } from '@/utils/types';

export default function ProductListPage({ pageTitle }: TPageInfo) {
  return (
    <>
      <AppHelmet title={pageTitle} />
      <ProductList />
    </>
  );
}
