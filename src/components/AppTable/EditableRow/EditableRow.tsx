import type { EditableRowProps } from 'components/AppTable/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditableRow = ({ index, ...props }: EditableRowProps) => {
  return <tr {...props} />;
};

export default EditableRow;
