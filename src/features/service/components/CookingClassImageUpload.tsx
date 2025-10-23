import AppImageUpload from '@/components/AppImageUpload';
import type { ObjectType } from '@/utils/types';
import type { UploadFile } from 'antd';

type Props = {
  uploadMaxCount?: number;
  maximumFileSize?: number;
  disabled?: boolean;
  imageList: UploadFile<ObjectType>[];
  onImageListChange: (imageList: UploadFile<ObjectType>[]) => void;
};

export default function CookingClassImageUpload({
  uploadMaxCount = 10,
  maximumFileSize = 10,
  disabled = false,
  imageList,
  onImageListChange,
}: Props) {
  return (
    <AppImageUpload
      uploadMaxCount={uploadMaxCount}
      maximumFileSize={maximumFileSize}
      disabled={disabled}
      imageList={imageList}
      onImageListChange={onImageListChange}
      mode="cookingClass"
      label="Cooking Class Images"
      required={true}
      enableDragAndDrop={true}
      enableSorting={true}
      firstImageLarge={true}
    />
  );
}
