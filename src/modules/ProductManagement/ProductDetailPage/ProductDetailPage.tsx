import AppHelmet from '@/components/AppHelmet/AppHelmet';
import AppPageHeader from '@/components/AppPageHeader/AppPageHeader';
import ProductDetail from '@/features/product-management/components/ProductDetail';
import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
  const { productId } = useParams<{
    productId: string;
  }>();

  const pageTitle =
    productId === 'create' ? 'Create a new product' : 'Product Detail';

  return (
    <>
      <AppHelmet title={pageTitle} />
      <AppPageHeader title={pageTitle} />
      <ProductDetail />
    </>
  );
}
