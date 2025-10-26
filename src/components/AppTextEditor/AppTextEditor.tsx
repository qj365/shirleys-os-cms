/* eslint-disable @typescript-eslint/no-explicit-any */
/* cSpell:disable */

import { api } from '@/lib/api/admin';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from './Editor';

import 'ckeditor5/ckeditor5.css';
import { useRef } from 'react';

const AppTextEditor = ({
  value,
  placeholder,
  onBlur,
  isShowMediaFeatures = true,
}: any) => {
  const editorRef = useRef(null);

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
      ref={editorRef}
      onReady={editor => {
        (editorRef as any).current = { editor };
      }}
      editor={Editor}
      data={value}
      config={{
        licenseKey: 'GPL',
        extraPlugins: isShowMediaFeatures ? [uploadPlugin] : [],
        placeholder: placeholder ?? '',
        toolbar: isShowMediaFeatures
          ? undefined // Use default toolbar with all features
          : {
              items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                '|',
                'bulletedList',
                'numberedList',
                '|',
                'outdent',
                'indent',
                '|',
                'blockQuote',
                'insertTable',
                '|',
                'undo',
                'redo',
              ],
            },
      }}
      onBlur={(_, editor) => {
        const data = (editor as any)?.getData();
        const cleaned = data
          .replace(/\s+srcset="[^"]*"/g, '')
          .replace(/\s+sizes="[^"]*"/g, '');
        onBlur?.(cleaned);
      }}
    />
  );
};

export default AppTextEditor;
