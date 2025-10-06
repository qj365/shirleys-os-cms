import AppPageHeader from '@/components/AppPageHeader/AppPageHeader';
import AppPageHeaderFilter from '@/components/AppPageHeaderFilter';
import { getPath } from '@/routers/router-paths';
import type { TPageInfo } from '@/utils/types';
import { Button, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ProductList({ pageTitle }: TPageInfo) {
  const navigate = useNavigate();

  return (
    <>
      <AppPageHeader
        title={pageTitle}
        addon={
          <div className="flex items-center justify-end gap-x-2">
            <AppPageHeaderFilter
              title="Search Product"
              formElements={
                <Form.Item name="keyword" label="Search keyword">
                  <Input placeholder={'Search by category name'} allowClear />
                </Form.Item>
              }
            />

            <Button
              type="primary"
              onClick={() => navigate(getPath('productDetailPage', 'create'))}
            >
              Create Product
            </Button>
          </div>
        }
      />
    </>
  );
}
