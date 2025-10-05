import type { Rule } from 'antd/es/form';
import EditableCell from 'components/AppTable/EditableCell';
import EditableRow from 'components/AppTable/EditableRow';
import type {
  TCellEditState,
  TEditableTableColumn,
} from 'components/AppTable/types';
import { useEffect, useMemo, useState } from 'react';
import { messageUtils } from 'utils';
import type { ObjectType } from 'utils/types';

type EditableCellHelperProps<T> = {
  commonColumns: TEditableTableColumn<T>[];
  recordKey: string;
  formValidation?: Record<string, Rule[]>;
  onSave: (values: T) => void;
  isSuccess: boolean;
};

function useEditableCellHelper<T>({
  commonColumns,
  recordKey,
  formValidation,
  onSave,
  isSuccess,
}: EditableCellHelperProps<T>) {
  const [cellEditState, setCellEditState] = useState<TCellEditState>({
    isEditing: false,
    dataIndex: undefined,
    recordKey: undefined,
  });

  const { message } = messageUtils;

  const tableColumns = useMemo(
    (): TEditableTableColumn<T>[] =>
      commonColumns.map(col => {
        if (!col.editable) {
          return col;
        }
        const dataIndex = col?.['dataIndex' as keyof TEditableTableColumn<T>];
        return {
          ...col,
          onCell: (record: ObjectType) => ({
            record,
            cellEditState,
            setCellEditState,
            recordKey: record?.[`${recordKey}`],
            editable: col.editable,
            dataIndex,
            fieldRule: !Array.isArray(dataIndex)
              ? (formValidation?.[dataIndex as string] ?? [])
              : [],
            onSave,
          }),
        };
      }) as TEditableTableColumn<T>[],
    [
      cellEditState,
      setCellEditState,
      commonColumns,
      formValidation,
      recordKey,
      onSave,
    ]
  );

  useEffect(() => {
    if (!isSuccess) return;
    void message.success(`Cập nhật thành công`);
  }, [isSuccess, message]);

  const tableComponents = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return { tableColumns, tableComponents };
}

export default useEditableCellHelper;
