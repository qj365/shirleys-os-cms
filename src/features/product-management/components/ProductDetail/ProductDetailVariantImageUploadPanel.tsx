import { DEFAULT_PANEL_WIDTH } from '@/components/Overlays/constants';
import { useWindowDimensions } from '@/utils/hooks/useWindowDimensions';
import { Drawer } from 'antd';
import { type Dispatch } from 'react';
import ProductDetailImageUpload from './ProductDetailImageUpload';

type Props = {
  open: boolean;
  setOpen: Dispatch<boolean>;
  onSelectImage?: (imageUrl: string) => void;
};

const ProductDetailVariantImageUploadPanel = ({
  open,
  setOpen,
  onSelectImage,
}: Props) => {
  const windowDimensions = useWindowDimensions();

  const isLandscapeTablet = windowDimensions?.width < 1024;

  const onCancel = () => {
    setOpen(false);
  };

  const handleSelectImage = (imageUrl: string) => {
    onSelectImage?.(imageUrl);
    onCancel();
  };

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      footer={null}
      width={isLandscapeTablet ? '90vw' : DEFAULT_PANEL_WIDTH}
      title={'Select file or Upload new'}
    >
      <ProductDetailImageUpload
        label=""
        name=""
        required
        mode={'variantImage'}
        onSelectImage={handleSelectImage}
      />
    </Drawer>
  );
};

export default ProductDetailVariantImageUploadPanel;
