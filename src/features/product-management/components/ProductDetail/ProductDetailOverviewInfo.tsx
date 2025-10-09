import AppPaperBox from '@/components/AppPaperBox';
import { api } from '@/lib/api/admin';
import { skuGenerator } from '@/utils/dataTypes/string';
import type { ObjectType } from '@/utils/types';
import { Regex, RegexValidationMessage } from '@/utils/validations';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { Form, Input } from 'antd';
import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';
import ProductCategorySelection from './ProductCategorySelection';
import AppTextEditor from '@/components/AppTextEditor/AppTextEditor';

const { useFormInstance } = Form;

export default function ProductDetailOverviewInfo() {
  const form = useFormInstance();

  const checkSKUDuplicate = useMemo(
    () =>
      debounce(async (sku, resolve, reject) => {
        try {
          const response = await api.product.checkExistingSku({ sku });

          if (response) {
            reject(new Error('SKU is duplicated'));
          } else {
            resolve();
          }
        } catch {
          reject(new Error('Error checking SKU. Please try again.'));
        }
      }, 500),
    []
  );

  const validateSKU = async (_: ObjectType, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please enter SKU.'));
    }
    if (!Regex.SKU.test(value)) {
      return Promise.reject(new Error(RegexValidationMessage.SKU));
    }

    return new Promise((resolve, reject) => {
      checkSKUDuplicate(value, resolve, reject);
    });
  };

  useEffect(() => {
    const initialSKU = form.getFieldValue('sku');
    if (initialSKU) {
      form.validateFields(['sku']);
    }
  }, [form]);

  useEffect(() => {
    return () => {
      checkSKUDuplicate.cancel();
    };
  }, [checkSKUDuplicate]);

  return (
    <AppPaperBox className="p-4">
      <h3 className="mb-4 line-clamp-2 text-lg font-semibold text-primary">
        Overview Information
      </h3>
      <div className="grid grid-cols-12 gap-x-4">
        <Form.Item
          name="name"
          label="Product name"
          rules={[{ required: true }]}
          className="col-span-12"
        >
          <Input showCount placeholder="Enter product name" maxLength={120} />
        </Form.Item>
        <Form.Item
          name="sku"
          label="SKU"
          rules={[
            {
              validator: validateSKU,
            },
          ]}
          className="col-span-4"
          tooltip="Stock-Keeping Unit"
        >
          <Input
            placeholder="Enter SKU"
            maxLength={12}
            suffix={
              <ReloadOutlined
                onClick={() => {
                  form.setFieldValue('sku', skuGenerator(12));
                  form.validateFields(['sku']);
                }}
              />
            }
          />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Product category"
          rules={[{ required: true }]}
          className="col-span-8"
        >
          <ProductCategorySelection
            name="categoryId"
            placeholder="Select category"
            initialSearchKeyword=""
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true }]}
          className="col-span-12"
        >
          <AppTextEditor max={10000} placeholder="Enter product description" />
        </Form.Item>
      </div>
    </AppPaperBox>
  );
}
