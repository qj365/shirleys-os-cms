import AppPaperBox from '@/components/AppPaperBox';
import AppTable from '@/components/AppTable';
import {
  _36_Enums_FulfillmentStatus,
  api,
  type AdminGetOrdersResponse,
  type NumberedPagingResponse_AdminGetOrdersResponse_Array_,
} from '@/lib/api/admin';
import {
  formatDisplayCurrency,
  toastErrorMessage,
} from '@/utils/dataTypes/string';
import useDebounceSearch from '@/utils/hooks/useDebounceSearch';
import useHandlePagination from '@/utils/hooks/useHandlePagination';
import type { TPageInfo } from '@/utils/types';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  message,
  Tabs,
  Tag,
  type TabsProps,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPath } from '@/routers/router-paths';

const { RangePicker } = DatePicker;

export default function OrderList({ pageTitle }: TPageInfo) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [tabActiveKey, setTabActiveKey] = useState<string>('ALL');
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const { pageSize, pageIndex, handleChangePageSize, handleChangePageIndex } =
    useHandlePagination();

  const { searchKeyword, debounceSearchFn } = useDebounceSearch();

  const [getOrdersResponse, setGetOrdersResponse] =
    useState<NumberedPagingResponse_AdminGetOrdersResponse_Array_ | null>(null);

  const handleGetOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.order.adminOrderGetAll({
        pageSize,
        page: pageIndex,
        ...(searchKeyword && {
          orderCode: searchKeyword,
        }),
        ...(dateRange?.[0] && {
          startDate: dateRange[0].startOf('day').toISOString(),
        }),
        ...(dateRange?.[1] && {
          endDate: dateRange[1].endOf('day').toISOString(),
        }),
      });
      setGetOrdersResponse(response);
    } catch (err) {
      toastErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, searchKeyword, dateRange]);

  const handleOpenFulfillModal = (id: number) => {
    setSelectedOrderId(id);
    setIsFulfillModalOpen(true);
  };

  const handleCloseFulfillModal = () => {
    setIsFulfillModalOpen(false);
    setSelectedOrderId(null);
    form.resetFields();
  };

  const handleFulfillOrder = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedOrderId) return;

      await api.order.adminOrderFulfill({
        id: selectedOrderId,
        requestBody: {
          trackingNumber: values.trackingNumber,
          courierCode: values.carrier,
          courierName: values.carrier === 'fedex' ? 'FedEx' : '',
        },
      });
      void message.success('Order fulfilled successfully');
      handleCloseFulfillModal();
      handleGetOrders();
    } catch (e) {
      toastErrorMessage(e);
    }
  };

  const countOrdersByStatus = (status: string) => {
    if (status === 'ALL') return getOrdersResponse?.data?.length || 0;

    return (
      getOrdersResponse?.data?.filter(
        item => item?.fulfillmentStatus === status
      )?.length || 0
    );
  };

  const items: TabsProps['items'] = [
    {
      key: 'ALL',
      label: `All (${countOrdersByStatus('ALL')})`,
    },
    {
      key: _36_Enums_FulfillmentStatus.UNFULFILLED.toString(),
      label: `Processing (${countOrdersByStatus(_36_Enums_FulfillmentStatus.UNFULFILLED)})`,
    },
    {
      key: _36_Enums_FulfillmentStatus.FULFILLED.toString(),
      label: `Fulfilled (${countOrdersByStatus(_36_Enums_FulfillmentStatus.FULFILLED)})`,
    },
    {
      key: _36_Enums_FulfillmentStatus.CANCELLED.toString(),
      label: `Cancelled (${countOrdersByStatus(_36_Enums_FulfillmentStatus.CANCELLED)})`,
    },
  ];

  const tableColumns: ColumnsType<AdminGetOrdersResponse> = [
    {
      title: 'Order Code',
      width: 180,
      dataIndex: 'orderCode',
      render: code => code || 'N/A',
    },
    {
      title: 'Order Date',
      width: 180,
      dataIndex: 'orderAt',
      render: date =>
        date ? (
          <>
            <div>{dayjs(date).format('YYYY-MM-DD')}</div>
            <div>{dayjs(date).format('HH:mm')}</div>
          </>
        ) : (
          'N/A'
        ),
    },
    {
      title: 'Total',
      width: 150,
      dataIndex: 'total',
      render: total => <span>{formatDisplayCurrency(total.toFixed(2))}</span>,
    },
    {
      title: 'Status',
      width: 150,
      dataIndex: 'fulfillmentStatus',
      render: (status: string) => {
        let color = 'default';
        switch (status) {
          case _36_Enums_FulfillmentStatus.FULFILLED:
            color = 'green';
            break;
          case _36_Enums_FulfillmentStatus.CANCELLED:
            color = 'red';
            break;
          case _36_Enums_FulfillmentStatus.UNFULFILLED:
            color = 'default';
            break;
          default:
            color = 'default';
        }
        return (
          <Tag
            color={color}
            className="flex min-w-20 shrink-0 items-center justify-center"
          >
            {status || 'Pending'}
          </Tag>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (record: AdminGetOrdersResponse) => {
        // Only show fulfill button for unfulfilled orders
        if (
          record.fulfillmentStatus !== _36_Enums_FulfillmentStatus.UNFULFILLED
        ) {
          return <>---</>;
        }
        return (
          <Button
            type="text"
            size="small"
            className="text-primary hover:cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              handleOpenFulfillModal(record.id);
            }}
          >
            Fulfill Order
          </Button>
        );
      },
    },
  ];

  const handleRowClick = (record: AdminGetOrdersResponse) => {
    navigate(getPath('orderDetailPage', record?.id?.toString()));
  };

  useEffect(() => {
    handleGetOrders();
  }, [handleGetOrders]);

  return (
    <>
      {/* <AppPageHeader title={pageTitle} /> */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Search by order code"
            onChange={e => debounceSearchFn(e?.target?.value)}
            allowClear
            className="w-60"
          />
          <RangePicker
            onChange={dates =>
              setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
            }
            value={dateRange}
          />
        </div>
      </div>

      <AppPaperBox className="p-4">
        <Tabs
          activeKey={tabActiveKey}
          items={items}
          onChange={setTabActiveKey}
          className="[&_.ant-tabs-tab]:!min-w-25 [&_.ant-tabs-tab]:!text-base"
        />
        <AppTable
          rowKey={record => record.id}
          dataSource={(getOrdersResponse?.data || []).filter(item => {
            if (tabActiveKey === 'ALL') return true;

            return item.fulfillmentStatus === tabActiveKey;
          })}
          columns={tableColumns}
          loading={isLoading}
          mode="simple"
          onRow={record => ({
            onClick: () => handleRowClick(record),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
          pagination={{
            total: getOrdersResponse?.total || 0,
            current: pageIndex,
            pageSize,
            onChange: (p, ps) => {
              handleChangePageIndex(p);
              handleChangePageSize(ps);
            },
          }}
        />
      </AppPaperBox>

      <Modal
        title="Fulfill Order"
        open={isFulfillModalOpen}
        onCancel={handleCloseFulfillModal}
        onOk={handleFulfillOrder}
        okText="Fulfill Order"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="trackingNumber"
            label="Tracking Number"
            rules={[
              { required: true, message: 'Please enter tracking number' },
            ]}
          >
            <Input placeholder="Enter tracking number" />
          </Form.Item>

          <Form.Item
            name="carrier"
            label="Carrier"
            rules={[{ required: true, message: 'Please select a carrier' }]}
          >
            <Select placeholder="Select carrier">
              <Select.Option value="fedex">FedEx</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
