import AppHelmet from '@/components/AppHelmet/AppHelmet';
import AppPageHeader from '@/components/AppPageHeader/AppPageHeader';
import OrderDetail from '@/features/product-management/components/OrderDetail';

export default function OrderDetailPage() {
  const pageTitle = 'Order Detail';

  return (
    <>
      <AppHelmet title={pageTitle} />
      {/* <AppPageHeader title={pageTitle} /> */}
      <OrderDetail />
    </>
  );
}
