import EyeOutlined from '@ant-design/icons/EyeOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import { Form, Image, Upload } from 'antd';
import type {
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from 'antd/es/upload';
import { useCallback, useState } from 'react';
import type { ObjectType } from 'utils/types';
import type { TFileUpload } from './helper';
import {
  acceptedMIMETypes,
  getPreviewUrl,
  handleFileValidation,
} from './helper';

type Props = {
  name: string;
  label: string;
  required: boolean;
  uploadMaxCount?: number;
  maximumFileSize?: number;
  disabled?: boolean;
  multiple?: boolean;
};

const { Dragger } = Upload;

const AppImageUpload = ({
  name,
  label,
  required,
  uploadMaxCount = 10,
  maximumFileSize = 5,
  disabled = false,
  multiple = true,
}: Props) => {
  const [fileList, setFileList] = useState<TFileUpload[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewImages, setPreviewImages] = useState<string[] | null>(null);

  const handleChange: UploadProps['onChange'] = useCallback(
    async ({ fileList }: UploadChangeParam<TFileUpload>) => {
      try {
        const files = fileList
          .filter((file: TFileUpload) =>
            handleFileValidation({
              file,
              maximumFileSize,
              isCheckBeforeUpload: false,
            })
          )
          .slice(0, uploadMaxCount);

        setFileList(files);
      } catch (err) {
        console.error('Error processing file upload:', err);
      }
    },
    [uploadMaxCount, maximumFileSize]
  );

  const handlePreview = useCallback(
    async (file: UploadFile) => {
      await getPreviewUrl(file);

      const filePreviews = await Promise.all(fileList.map(getPreviewUrl));

      setPreviewImage(file.url || (file.preview as string));

      setPreviewImages(filePreviews as string[]);

      setPreviewOpen(true);
    },
    [fileList]
  );

  const normFile = useCallback(
    (e: ObjectType) => (Array.isArray(e) ? e : e?.fileList),
    []
  );

  return (
    <>
      <Form.Item
        name={name}
        label={label}
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[
          {
            required: required,
            message: 'Vui lòng tải lên hình ảnh',
          },
          {
            validator(_, value) {
              if (required && (!value || value?.length <= 0)) {
                return Promise.reject();
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Dragger
          listType="picture-card"
          beforeUpload={file =>
            handleFileValidation({
              file,
              maximumFileSize,
              isCheckBeforeUpload: true,
            })
          }
          onChange={handleChange}
          multiple={multiple}
          fileList={fileList}
          onPreview={handlePreview}
          accept={acceptedMIMETypes.join(', ')}
          disabled={disabled}
          maxCount={uploadMaxCount}
          showUploadList={{
            previewIcon: file =>
              file.status === 'error' ? null : <EyeOutlined />,
          }}
          className="[&_div.ant-upload-list]:mt-6"
        >
          <UploadOutlined className="!text-[48px] text-primary" />
          <p className="ant-upload-text">
            Click to select an image or drag it into the box to upload
          </p>
          <p className="ant-upload-hint">
            Only .png, .jpg, or .jpeg image formats are supported
          </p>
          <p className="ant-upload-hint">Maximum size is {maximumFileSize}MB</p>
          <p className="ant-upload-hint">
            Upload a maximum of {uploadMaxCount} files.
          </p>
        </Dragger>
      </Form.Item>

      {previewImage && (
        <Image.PreviewGroup
          items={previewImages || []}
          preview={{
            visible: previewOpen,
            onVisibleChange: visible => setPreviewOpen(visible),
            afterOpenChange: visible => !visible && setPreviewImage(''),
          }}
        >
          <Image wrapperStyle={{ display: 'none' }} src={previewImage} />
        </Image.PreviewGroup>
      )}
    </>
  );
};

export default AppImageUpload;
