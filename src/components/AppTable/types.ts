import type { Rule } from 'antd/es/form';
import type { ObjectType } from 'utils/types';
import type { Dispatch, SetStateAction } from 'react';
import type { ColumnsType } from 'antd/es/table';

export type TEditableTableColumn<T> = ColumnsType<T>[number] & {
  editable?: boolean;
};

export type EditableRowProps = {
  index: number;
};

export type TCellEditState = {
  isEditing: boolean;
  dataIndex?: string;
  recordKey?: number | string;
};

export type EditableCellProps = {
  editable: boolean;
  dataIndex: string;
  fieldRule: Rule[];
  recordKey: number | string;
  record: ObjectType;
  onSave: (record: ObjectType) => void;
  cellEditState: TCellEditState;
  setCellEditState: Dispatch<SetStateAction<TCellEditState>>;
  inputType: 'text' | 'number';
};
