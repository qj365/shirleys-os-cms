import AppPaperBox from '@/components/AppPaperBox';
import {
  _36_Enums_FulfillmentStatus,
  api,
  type AdminGetOrderByIdResponse,
} from '@/lib/api/admin';
import {
  formatDisplayCurrency,
  toastErrorMessage,
} from '@/utils/dataTypes/string';
import { Button, Form, Image, Input, message, Modal, Select, Tag } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderData, setOrderData] = useState<AdminGetOrderByIdResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [cancelForm] = Form.useForm();

  const handleGetOrderDetail = useCallback(async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      const response = await api.order.adminOrderGetById({
        id: Number(orderId),
      });
      setOrderData(response);
    } catch (err) {
      toastErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const handleOpenFulfillModal = () => {
    setIsFulfillModalOpen(true);
  };

  const handleCloseFulfillModal = () => {
    setIsFulfillModalOpen(false);
    form.resetFields();
  };

  const handleFulfillOrder = async () => {
    try {
      const values = await form.validateFields();
      if (!orderId) return;

      await api.order.adminOrderFulfill({
        id: Number(orderId),
        requestBody: {
          trackingNumber: values.trackingNumber,
          courierCode: values.carrier,
          courierName: values.carrier === 'fedex' ? 'FedEx' : '',
        },
      });
      void message.success('Order fulfilled successfully');
      handleCloseFulfillModal();
      handleGetOrderDetail();
    } catch (e) {
      toastErrorMessage(e);
    }
  };

  const handleOpenCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    cancelForm.resetFields();
  };

  const handleCancelOrder = async () => {
    try {
      const values = await cancelForm.validateFields();
      if (!orderId) return;

      await api.order.adminOrderCancel({
        id: Number(orderId),
        requestBody: {
          orderCancelNote: values.reason,
        },
      });
      void message.success('Order cancelled successfully');
      handleCloseCancelModal();
      handleGetOrderDetail();
    } catch (e) {
      toastErrorMessage(e);
    }
  };

  useEffect(() => {
    handleGetOrderDetail();
  }, [handleGetOrderDetail]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span>Order not found</span>
      </div>
    );
  }

  const {
    orderItems,
    fulfillmentStatus,
    orderCode,
    orderAt,
    trackingNumber,
    courierName,
    total,
    orderInfo,
    orderCancelNote,
  } = orderData;

  const getFulfillmentStatusColor = (status: string | null) => {
    switch (status) {
      case _36_Enums_FulfillmentStatus.FULFILLED:
        return 'green';
      case _36_Enums_FulfillmentStatus.CANCELLED:
        return 'red';
      case _36_Enums_FulfillmentStatus.UNFULFILLED:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Section - Customer Information */}
      <div className="lg:col-span-1">
        <AppPaperBox className="p-6">
          <h2 className="mb-2 text-2xl font-semibold">Customer</h2>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-primary">{orderCode || 'N/A'}</p>
            </div>

            <div>
              <Tag
                color={getFulfillmentStatusColor(fulfillmentStatus)}
                className="rounded px-3 py-1"
              >
                {fulfillmentStatus || 'Pending'}
              </Tag>
            </div>

            <div className="pt-2">
              <p className="text-sm">
                {`${[orderInfo?.shippingAddress1, orderInfo?.shippingCity, orderInfo?.shippingProvince, orderInfo?.shippingCountry].filter(Boolean).join(', ')}`}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone Number</span>
                <span className="font-semibold">
                  {orderInfo?.phone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Post code</span>
                <span className="font-semibold">
                  {orderInfo?.shippingZipCode || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time order</span>
                <span className="font-semibold">
                  {orderAt
                    ? dayjs(orderAt).format('DD/MM/YYYY - HH:mm')
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-semibold">{orderInfo?.email || 'N/A'}</span>
            </div>

            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-semibold">Billing address</p>
              {orderInfo?.billingAddress1 === orderInfo?.shippingAddress1 &&
              orderInfo?.billingAddress2 === orderInfo?.shippingAddress2 &&
              orderInfo?.billingCity === orderInfo?.shippingCity &&
              orderInfo?.billingProvince === orderInfo?.shippingProvince &&
              orderInfo?.billingZipCode === orderInfo?.shippingZipCode &&
              orderInfo?.billingCountry === orderInfo?.shippingCountry ? (
                <p className="text-sm text-gray-500">
                  Same as shipping address
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  {`${[orderInfo?.billingAddress1, orderInfo?.billingCity, orderInfo?.billingProvince, orderInfo?.billingCountry].filter(Boolean).join(', ')}`}
                </p>
              )}
            </div>
          </div>
        </AppPaperBox>
      </div>

      {/* Right Section - Invoice Details */}
      <div className="lg:col-span-2">
        <AppPaperBox className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Invoice</h2>
            {fulfillmentStatus === _36_Enums_FulfillmentStatus.UNFULFILLED && (
              <div className="flex gap-2">
                <Button danger onClick={handleOpenCancelModal}>
                  Cancel order
                </Button>
                <Button type="primary" onClick={handleOpenFulfillModal}>
                  Fulfill order
                </Button>
              </div>
            )}
          </div>

          {/* Shipping Status */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="mb-1 text-sm font-semibold">Shipping</p>
            {fulfillmentStatus === _36_Enums_FulfillmentStatus.FULFILLED ? (
              <div className="space-y-2">
                {/* <p className="text-sm font-medium text-green-600">Fulfilled</p> */}
                {trackingNumber && (
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Tracking Number:{' '}
                      </span>
                      <span className="text-gray-500">{trackingNumber}</span>
                    </p>
                    {courierName && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Carrier:{' '}
                        </span>
                        <span className="text-gray-500">
                          {courierName || ''}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {fulfillmentStatus === _36_Enums_FulfillmentStatus.CANCELLED
                  ? 'Cancelled'
                  : 'Awaiting Fulfillment'}
              </p>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="mb-4 grid grid-cols-12 gap-4 border-b pb-2 text-sm font-semibold text-gray-500">
              <div className="col-span-6">Items</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div className="space-y-4">
              {orderItems?.map(
                (
                  item: {
                    id: number;
                    name: string;
                    image: string;
                    price: number;
                    quantity: number;
                    total: number;
                    productName: string;
                  },
                  index: number
                ) => {
                  return (
                    <div
                      key={item.id || index}
                      className="grid grid-cols-12 gap-4 border-b pb-4 last:border-b-0"
                    >
                      <div className="col-span-6 flex gap-3 text-sm">
                        <Image
                          preview={false}
                          width={80}
                          height={80}
                          src={item.image || ''}
                          alt={item.name || 'Product'}
                          className="flex-shrink-0 rounded border object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                          <p className="font-medium">
                            {orderCode || `Order #${orderData.id}`}
                          </p>
                          <p className="line-clamp-2 font-semibold">
                            {item.productName || 'N/A'}
                          </p>
                          <p className="text-gray-500">{item.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <p className="text-sm">
                          {formatDisplayCurrency(
                            item.price?.toFixed(2) as unknown as number
                          )}
                        </p>
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <p className="text-sm">x{item.quantity}</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <p className="text-sm">
                          {formatDisplayCurrency(
                            item.total?.toFixed(2) as unknown as number
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Note and Price Breakdown - Side by Side */}
          <div className="flex gap-6">
            {/* Note Section - Left */}
            <div className="flex-1 rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm font-semibold">Note</p>
              <p className="text-sm text-gray-500">
                {orderCancelNote || '---'}
              </p>
            </div>

            {/* Price Breakdown - Right */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>
                  {formatDisplayCurrency(
                    total?.toFixed(2) as unknown as number
                  )}
                </span>
              </div>
            </div>
          </div>
        </AppPaperBox>
      </div>

      {/* Fulfill Order Modal */}
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

      {/* Cancel Order Modal */}
      <Modal
        title="Cancel Order"
        open={isCancelModalOpen}
        onCancel={handleCloseCancelModal}
        onOk={handleCancelOrder}
        okText="Cancel Order"
        cancelText="Close"
        okButtonProps={{ danger: true }}
      >
        <Form form={cancelForm} layout="vertical" className="mt-4">
          <Form.Item
            name="reason"
            label="Cancellation Reason"
            rules={[
              {
                required: true,
                message: 'Please enter a reason for cancellation',
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter the reason for cancelling this order"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
