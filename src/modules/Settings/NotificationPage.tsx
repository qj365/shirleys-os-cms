import AppHelmet from '@/components/AppHelmet/AppHelmet';
import AppPaperBox from '@/components/AppPaperBox/AppPaperBox';
import type { TPageInfo } from '@/utils/types';
import { api } from '@/lib/api/admin';
import type { UpdateNotificationSettingDto } from '@/lib/api/admin/client';
import { useEffect, useState } from 'react';
import {
  Button,
  Switch,
  InputNumber,
  Form,
  message,
  Spin,
  Typography,
} from 'antd';

export default function NotificationPage({ pageTitle }: TPageInfo) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] =
    useState<UpdateNotificationSettingDto | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      const response = await api.notifications.adminNotificationGetSettings();
      const values = {
        lowStockNotification: response.lowStockNotification,
        lowStockValue: response.lowStockValue,
      };

      form.setFieldsValue(values);
      setInitialValues(values);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      message.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (values: UpdateNotificationSettingDto) => {
    try {
      setSaving(true);
      // If notifications are disabled, ensure we still send a valid threshold value
      const payload = {
        ...values,
        // Always ensure lowStockValue is a number >= 1 even when notifications are off
        lowStockValue: values.lowStockValue || 5,
      };

      await api.notifications.adminNotificationUpdateSettings({
        requestBody: payload,
      });

      // Update initial values to the new saved state
      setInitialValues(payload);
      setHasChanges(false);

      message.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      message.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Check if form values are different from initially loaded values
  const checkFormChanges = () => {
    if (!initialValues) return;

    const currentValues = form.getFieldsValue();
    const hasChanged =
      currentValues.lowStockNotification !==
        initialValues.lowStockNotification ||
      currentValues.lowStockValue !== initialValues.lowStockValue;

    setHasChanges(hasChanged);
  };

  return (
    <>
      <AppHelmet title={pageTitle} />
      {/* <AppPageHeader title={pageTitle} /> */}

      <AppPaperBox className="p-6">
        <div className="mb-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveSettings}
              initialValues={{
                lowStockNotification: false,
                lowStockValue: 5,
              }}
              onValuesChange={checkFormChanges}
            >
              <div className="max-w-2xl">
                <Form.Item>
                  <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium dark:text-gray-200">
                          Low Stock Alerts
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Get notified when product inventory falls below the
                          threshold.
                        </p>
                      </div>
                      <Form.Item
                        name="lowStockNotification"
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch />
                      </Form.Item>
                    </div>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.lowStockNotification !==
                        currentValues.lowStockNotification
                      }
                    >
                      {({ getFieldValue }) => {
                        const isEnabled = getFieldValue('lowStockNotification');
                        return (
                          <div
                            className={isEnabled ? 'opacity-100' : 'opacity-50'}
                          >
                            <Form.Item
                              name="lowStockValue"
                              label="Low Stock Threshold"
                              tooltip="Products with inventory below this value will trigger low stock alerts"
                            >
                              <InputNumber
                                min={1}
                                max={100}
                                className="w-32"
                                disabled={!isEnabled}
                              />
                            </Form.Item>
                            <Typography.Text
                              type="secondary"
                              className="text-sm"
                            >
                              {isEnabled
                                ? "You'll receive notifications when product stock falls below this value."
                                : 'Enable low stock alerts to set the threshold value.'}
                            </Typography.Text>
                          </div>
                        );
                      }}
                    </Form.Item>
                  </div>
                </Form.Item>

                <Form.Item>
                  <div className="flex items-center">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      disabled={!hasChanges}
                    >
                      Save Settings
                    </Button>

                    {hasChanges && (
                      <Typography.Text className="ml-3 text-sm text-orange-500">
                        You have unsaved changes
                      </Typography.Text>
                    )}
                  </div>
                </Form.Item>
              </div>
            </Form>
          )}
        </div>
      </AppPaperBox>
    </>
  );
}
