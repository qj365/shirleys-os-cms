import AppHelmet from '@/components/AppHelmet/AppHelmet';
import ProductCategoryList from '@/features/product-management/components/ProductCategoryList';
import type { TPageInfo } from '@/utils/types';

export default function CategoryListPage({ pageTitle }: TPageInfo) {
  return (
    <>
      <AppHelmet title={pageTitle} />
      <ProductCategoryList pageTitle={pageTitle} />
    </>
  );
}
