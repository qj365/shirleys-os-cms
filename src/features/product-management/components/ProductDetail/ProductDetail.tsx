import AppPaperBox from '@/components/AppPaperBox';
import { getPath } from '@/routers/router-paths';
import { skuGenerator } from '@/utils/dataTypes/string';
import useSetSelectedMenuKeys from '@/utils/hooks/useSetSelectedMenuKeys';
import type { ObjectType } from '@/utils/types';
import { Checkbox, Form } from 'antd';
import { useParams } from 'react-router-dom';
import ProductDetailImageUpload from './ProductDetailImageUpload';
import ProductDetailOverviewInfo from './ProductDetailOverviewInfo';
import ProductDetailPropertyConfig from './ProductDetailPropertyConfig';
import { ProductDetailVariants } from './ProductDetailVariants';

export default function ProductDetail() {
  const { productId } = useParams<{
    productId: string;
  }>();

  const isCreateNewProduct = productId === 'create';
  console.log(isCreateNewProduct);

  const [form] = Form.useForm();

  const onFinish = (values: ObjectType) => {
    console.log(values);
  };

  useSetSelectedMenuKeys({
    patterns: [getPath('productDetailPage', ':productId')],
    selectedMenuKeys: [getPath('productListPage')],
  });

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        onFinish={onFinish}
        initialValues={
          isCreateNewProduct
            ? {
                sku: skuGenerator(12),
                active: true,
              }
            : undefined
        }
      >
        <AppPaperBox className="p-4">
          <ProductDetailOverviewInfo />

          <ProductDetailImageUpload
            label="Product Images"
            name="images"
            required
          />

          <ProductDetailPropertyConfig />

          <ProductDetailVariants />

          <Form.Item
            name="status"
            className="col-span-8"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
        </AppPaperBox>
      </Form>
    </>
  );
}
