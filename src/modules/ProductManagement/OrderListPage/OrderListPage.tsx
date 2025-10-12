import AppHelmet from '@/components/AppHelmet/AppHelmet';
import OrderList from '@/features/product-management/components/OrderList';
import type { TPageInfo } from '@/utils/types';

export default function OrderListPage({ pageTitle }: TPageInfo) {
  return (
    <>
      <AppHelmet title={pageTitle} />
      <OrderList pageTitle={pageTitle} />
    </>
  );
}
