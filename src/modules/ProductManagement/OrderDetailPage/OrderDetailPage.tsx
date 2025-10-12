import AppHelmet from '@/components/AppHelmet/AppHelmet';
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
