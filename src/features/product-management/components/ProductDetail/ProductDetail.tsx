import AppPaperBox from '@/components/AppPaperBox';
import {
  useProductDetailStore,
  type Variant,
} from '@/lib/stores/productDetailStore';
import { getPath } from '@/routers/router-paths';
import { skuGenerator, toastErrorMessage } from '@/utils/dataTypes/string';
import useSetSelectedMenuKeys from '@/utils/hooks/useSetSelectedMenuKeys';
import type { ObjectType } from '@/utils/types';
import { Button, Checkbox, Form, message } from 'antd';
import { memo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductDetailImageUpload from './ProductDetailImageUpload';
import ProductDetailOverviewInfo from './ProductDetailOverviewInfo';
import ProductDetailPropertyConfig from './ProductDetailPropertyConfig';
import { ProductDetailVariants } from './ProductDetailVariants';
import { _36_Enums_ProductStatus, api } from '@/lib/api/admin';
import type { CreateProductDto } from '@/lib/api/customer';

const validateVariants = (variants: Variant[]) => {
  return variants.every(variant => {
    // Validate image
    if (!variant.image) {
      message.error(`Variant "${variant.name}": Image is Required`);
      return false;
    }

    // Validate price
    if (typeof variant.price !== 'number' || variant.price <= 0) {
      message.error(`Variant "${variant.name}": Price is Required`);
      return false;
    }

    // Validate compareAtPrice
    if (
      typeof variant.compareAtPrice !== 'number' ||
      variant.compareAtPrice <= 0
    ) {
      message.error(`Variant "${variant.name}": Compare Price is Required`);
      return false;
    }

    // Validate price < compareAtPrice
    if (variant.price >= variant.compareAtPrice) {
      message.error(
        `Variant "${variant.name}": Price must be less than Compare Price`
      );
      return false;
    }

    // Validate stock
    if (
      typeof variant.stock !== 'number' ||
      variant.stock < 0 ||
      variant.stock > 99999
    ) {
      message.error(
        `Variant "${variant.name}": Stock must be a number between 0 and 99999`
      );
      return false;
    }

    return true;
  });
};

const ProductDetail = () => {
  const { productId } = useParams<{
    productId: string;
  }>();

  const isCreateNewProduct = productId === 'create';

  const [form] = Form.useForm();

  const { imageList, variantOptions, variants, resetProductDetailStore } =
    useProductDetailStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const onScrollToElement = (elementId: string) =>
    document.querySelector(`#${elementId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

  const onFinish = async (values: ObjectType) => {
    if (!isCreateNewProduct) return;
    try {
      setIsSubmitting(true);

      if (!imageList?.length) {
        void message.error('Please upload your product image');
        onScrollToElement('productMedia');
        return;
      }
      if (!variantOptions?.length) {
        void message.error('Please add at least one product property');
        onScrollToElement('productProperties');
        return;
      }
      if (!variants?.length) {
        void message.error('Please add at least one product variant');
        onScrollToElement('productVariants');
        return;
      }

      const isValidVariants = validateVariants(variants);
      if (!isValidVariants) {
        onScrollToElement('productVariants');
        return;
      }

      const { status, name, sku, description, categoryId } = values || {};

      await api.product.createProduct({
        requestBody: {
          name,
          sku,
          description,
          categoryId,
          status: status
            ? _36_Enums_ProductStatus.ACTIVE
            : _36_Enums_ProductStatus.INACTIVE,
          images: imageList.map(img => img.url || ''),
          variantOptions,
          productVariants: variants.map(v => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, selected, ...variantPayload } = v || {};

            return { ...variantPayload };
          }),
        } as CreateProductDto,
      });
      void message.success(
        isCreateNewProduct
          ? 'Created new product successfully'
          : 'Updated product successfully'
      );

      resetProductDetailStore();

      navigate(getPath('productListPage'));
    } catch (error) {
      toastErrorMessage(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useSetSelectedMenuKeys({
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

          <p id="productMedia" className="h-2" />
          <ProductDetailImageUpload />

          <p id="productProperties" className="h-2" />
          <ProductDetailPropertyConfig />

          <p id="productVariants" className="h-2" />
          <ProductDetailVariants />

          <Form.Item
            name="status"
            className="col-span-8"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Public Product</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isCreateNewProduct ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </AppPaperBox>
      </Form>
    </>
  );
};

export default memo(ProductDetail);
