import { useState, useEffect, memo, useCallback } from 'react';
import {
  Dropdown,
  Badge,
  Empty,
  List,
  Typography,
  Space,
  Button,
  message,
} from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api/admin';
import type { AdminGetAllNotificationResponse } from '@/lib/api/admin';
import { _36_Enums_NotificationEvent } from '@/lib/api/admin/client/models/_36_Enums_NotificationEvent';
import { getPath } from '@/routers/router-paths';

type Notification = AdminGetAllNotificationResponse & {
  isHovered?: boolean;
};

type AppNotificationMenuProps = {
  invertColor?: boolean;
};

const AppNotificationMenu = ({ invertColor }: AppNotificationMenuProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.notifications.adminNotificationGetAll({
        pageSize: 10,
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optionally set up polling to refresh notifications
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark notification as read and navigate based on event type
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      await api.notifications.adminNotificationMarkAsRead({
        id: notification.id,
      });

      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
      );

      // Navigate based on notification event type
      if (notification.event === _36_Enums_NotificationEvent.ADMIN_LOW_STOCK) {
        // For low stock, navigate to product detail
        if (notification.data?.productId) {
          navigate(
            getPath('productDetailPage', notification.data.productId.toString())
          );
        }
      } else if (
        notification.event === _36_Enums_NotificationEvent.ADMIN_NEW_ORDER
      ) {
        // For new order, navigate to order detail
        if (notification.data?.orderId) {
          navigate(
            getPath('orderDetailPage', notification.data.orderId.toString())
          );
        }
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
      message.error('Failed to process notification');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();

      // Optimistic update
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      message.error('Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter(
    notification => !notification.isRead
  ).length;

  const notificationContent = (
    <div
      className="rounded-md bg-white shadow-md dark:bg-[--table-heading-color]"
      style={{ width: 350, maxHeight: 500, overflow: 'auto' }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 p-3">
        <Typography.Text strong>Notifications</Typography.Text>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
            title="Mark all as read"
          >
            Mark all
          </Button>
        )}
      </div>
      <List
        loading={loading}
        dataSource={notifications}
        locale={{
          emptyText: <Empty description="No notifications" className="py-4" />,
        }}
        renderItem={item => (
          <List.Item
            className={clsx(
              'border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700',
              !item.isRead && 'bg-blue-50/20 dark:bg-blue-900/10'
            )}
            style={{
              cursor: 'pointer',
              padding: '12px 16px',
            }}
            onClick={() => handleNotificationClick(item)}
          >
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center">
                  {!item.isRead && (
                    <Badge status="processing" className="mr-2" />
                  )}
                  <Typography.Text strong>{item.title}</Typography.Text>
                </div>
              </div>
              {item.description && (
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  {item.description}
                </Typography.Text>
              )}
              <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
                {new Date(item.createdAt).toLocaleString()}
              </Typography.Text>
            </Space>
          </List.Item>
        )}
        footer={null}
      />
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }}
      dropdownRender={() => notificationContent}
      placement="bottomRight"
      trigger={['click']}
    >
      <div
        style={{ marginRight: 12 }}
        className={clsx(
          'cursor-pointer transition-all duration-200',
          invertColor
            ? 'text-white hover:text-gray-200'
            : 'text-gray-700 hover:text-gray-900'
        )}
      >
        <Badge count={unreadCount} size="small" offset={[-4, 4]}>
          <BellOutlined className="!text-xl" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default memo(AppNotificationMenu);
