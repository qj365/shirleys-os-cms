import { useState, useEffect, memo, useCallback } from 'react';
import { Dropdown, Badge, Empty, List, Typography, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import style from '@/layouts/MainLayout/MainLayout.module.scss';

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type AppNotificationMenuProps = {
  invertColor?: boolean;
};

const AppNotificationMenu = ({ invertColor }: AppNotificationMenuProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications - replace with your actual API call
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with your API call
      const mockData: Notification[] = [
        {
          id: '1',
          message: 'New product added',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          message: 'Order #12345 completed',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      setNotifications(mockData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (id: string) => {
    // Mark notification as read
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Add additional logic if needed (e.g., navigate to relevant page)
  };

  const unreadCount = notifications.filter(
    notification => !notification.read
  ).length;

  const notificationContent = (
    <div
      className="rounded-md bg-white shadow-md dark:bg-[--table-heading-color]"
      style={{ width: 300, maxHeight: 400, overflow: 'auto' }}
    >
      <div className="border-b border-gray-100 p-3">
        <Typography.Text strong>Notifications</Typography.Text>
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
              'border-b border-gray-50 transition-all',
              !item.read && 'bg-blue-50/20'
            )}
            style={{
              cursor: 'pointer',
              padding: '12px 16px',
            }}
            onClick={() => handleNotificationClick(item.id)}
          >
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <div className="flex items-center">
                {!item.read && <Badge status="processing" className="mr-2" />}
                <Typography.Text strong>{item.message}</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
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
      dropdownRender={() => notificationContent}
      placement="bottomRight"
      overlayClassName="notification-menu-dropdown"
      trigger={['click']}
      overlayStyle={{
        minWidth: 300,
      }}
    >
      <div style={{ marginRight: 12 }}>
        <Badge count={unreadCount} size="small" offset={[-4, 4]}>
          <BellOutlined className="!text-xl" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default memo(AppNotificationMenu);
