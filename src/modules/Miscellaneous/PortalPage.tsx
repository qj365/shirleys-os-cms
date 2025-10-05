import AppHelmet from 'components/AppHelmet/AppHelmet';
import AppPageHeader from 'components/AppPageHeader/AppPageHeader';
import AppPaperBox from 'components/AppPaperBox';
import AnnuallyRevenueChart from 'features/analytic/components/AnnuallyRevenueChart';
import BookingByAirlinesChart from 'features/analytic/components/BookingByAirlinesChart';
import RecentBookingDataTable from 'features/analytic/components/RecentBookingDataTable';
import type { TPageInfo } from 'routers/constants';

export default function PortalPage({ pageTitle }: TPageInfo) {
  return (
    <>
      <AppHelmet title={pageTitle} />
      <AppPageHeader title={pageTitle} />

      <div className="mb-8 grid grid-cols-12 gap-x-8">
        <AppPaperBox className="col-span-3 p-6">
          <h2 className="mb-1 text-base font-semibold dark:text-gray-200">
            Biểu đồ đặt chỗ theo hãng
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Downloaded by operating system
          </p>
          <BookingByAirlinesChart />
        </AppPaperBox>

        <AppPaperBox className="col-span-9 p-6">
          <h2 className="mb-1 text-base font-semibold dark:text-gray-200">
            Biểu đồ doanh thu năm
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Downloaded by operating system
          </p>
          <AnnuallyRevenueChart />
        </AppPaperBox>
      </div>

      <RecentBookingDataTable />
    </>
  );
}
