import AppPaperBox from 'components/AppPaperBox';
import AppTable from 'components/AppTable/AppTable';
import sample from 'lodash/sample';
import { memo } from 'react';
import type { ObjectType } from 'utils/types';

const RecentBookingDataTable = () => {
  return (
    <AppPaperBox className="overflow-hidden rounded-2xl">
      <AppTable
        columns={[
          {
            title: 'Mã giao dịch',
            dataIndex: 'transactionCode',
          },
          {
            title: 'Mã đặt chỗ',
            dataIndex: 'bookingCode',
          },
          {
            title: 'Tình trạng',
            dataIndex: 'status',
          },
          {
            title: 'Hãng',
            dataIndex: 'airline',
          },
          {
            title: 'Hành trình',
            dataIndex: 'itineraryType',
          },
          {
            title: 'Lịch trình',
            render: (record: ObjectType) => (
              <p className="flex items-center gap-x-2 text-sm">
                {record.schedule}
                <span className="font-bold">{record.route}</span>
              </p>
            ),
          },
        ]}
        dataSource={Array(10)
          .fill(null)
          .map((_, i) => ({
            key: i,
            transactionCode: `ADOM0023${i}`,
            bookingCode: sample([
              '5IYT78',
              '5IYBNI',
              'G3DCXK',
              'PQ54XS',
              'SAGYUT',
            ]),
            status: sample(['Đặt giữ chỗ', 'Đã thanh toán', 'Lỗi']),
            airline: sample(['VN', 'VJ']),
            itineraryType: sample(['Một chiều', 'Khứ hồi']),
            route: sample(['DAD - HAN', 'HAN - DAD', 'HAN - SGN', 'SGN - HAN']),
            schedule: `27/09/2025`,
          }))}
        rowKey={(record: ObjectType) => record.key}
        pagination={false}
      />
    </AppPaperBox>
  );
};

export default memo(RecentBookingDataTable);
