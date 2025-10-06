import type { GetProp, UploadFile, UploadProps } from 'antd';
import { message } from 'antd';
import type { ObjectType } from '@/utils/types';

export type TFileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
export type TFileUpload = UploadFile<ObjectType>;

export const acceptedMIMETypes = ['image/jpeg', 'image/jpg', 'image/png'];

export const getBase64 = (file: TFileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

export const handleFileValidation = ({
  file,
  isCheckBeforeUpload,
  maximumFileSize,
}: {
  file: TFileUpload;
  isCheckBeforeUpload: boolean;
  maximumFileSize: number;
}) => {
  try {
    const isImg = acceptedMIMETypes.includes(file?.type || '');

    const fileName = file?.name || '';

    const errorStatusText: string[] = [];

    if (!isImg) {
      if (isCheckBeforeUpload) {
        message.error(
          `File ${fileName} is not in the correct format(JPG/PNG/JPEG)`
        );
      }
      errorStatusText.push('Invalid format');
    }

    const isValidFileSize = (file?.size || 0) / 1024 / 1024 <= maximumFileSize;

    if (!isValidFileSize) {
      if (isCheckBeforeUpload) {
        message.error(
          `File ${fileName} exceeds the maximum size of ${maximumFileSize}MB`
        );
      }
      errorStatusText.push(`larger than ${maximumFileSize}MB`);
    }

    if (!isImg || !isValidFileSize) {
      file.status = 'error';
      file.error = {
        statusText: 'Invalid file: ' + errorStatusText.join(', '),
      };
    }

    return isCheckBeforeUpload ? false : isImg && isValidFileSize;
  } catch {
    // Error intentionally ignored
  }
};

export const getPreviewUrl = async (file: UploadFile) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj as TFileType);
  }
  return file.preview;
};
