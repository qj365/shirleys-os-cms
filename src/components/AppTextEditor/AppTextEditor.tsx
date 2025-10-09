/* eslint-disable @typescript-eslint/no-explicit-any */
/* cSpell:disable */

import { api } from '@/lib/api/admin';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@dropship-dev/bettamax-editor';

const AppTextEditor = ({ placeholder, value, onChange, ...props }: any) => {
  function uploadAdapter(loader: { file: Promise<File> }) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then(async (file: File) => {
            try {
              const response = await api.uploadFile(file);
              resolve({
                default: response,
              });
            } catch (err) {
              console.error(err);
              reject(err);
            }
          });
        });
      },
    };
  }
  function uploadPlugin(editor: {
    plugins: {
      get: (arg0: string) => {
        (): any;
        new (): any;
        createUploadAdapter: (loader: any) => {
          upload: () => Promise<unknown>;
        };
      };
    };
  }) {
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return uploadAdapter(loader);
    };
  }
  return (
    <CKEditor
      disabled={props?.disable ?? false}
      editor={ClassicEditor}
      data={value}
      config={{
        licenseKey: 'GPL',
        extraPlugins: [uploadPlugin],
        placeholder: placeholder ?? '',
      }}
      onChange={(_, editor) => {
        const data = (editor as any)?.getData();
        const cleaned = data
          .replace(/\s+srcset="[^"]*"/g, '')
          .replace(/\s+sizes="[^"]*"/g, '');
        onChange?.(cleaned);
      }}
      {...props}
    />
  );
};

export default AppTextEditor;
