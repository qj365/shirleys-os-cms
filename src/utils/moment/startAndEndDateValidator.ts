import type { FormInstance, RuleObject } from 'antd/es/form';
import { Dayjs } from 'dayjs';

export enum FIELD_TYPE {
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
}

export const startAndEndDateValidator = (
  comparisonFieldName: string | (string | number)[],
  currentFieldType: FIELD_TYPE,
  customErrorMessage?: string
) => {
  return ({ getFieldValue }: FormInstance) => ({
    validator(_: RuleObject, value: Dayjs) {
      const isStartDate = currentFieldType === FIELD_TYPE.START_DATE;

      const comparisonFieldValue: Dayjs = getFieldValue(comparisonFieldName);

      if (
        !value ||
        !comparisonFieldValue ||
        (isStartDate
          ? comparisonFieldValue?.isSameOrAfter(value)
          : comparisonFieldValue?.isSameOrBefore(value))
      )
        return Promise.resolve();

      return Promise.reject(
        new Error(
          customErrorMessage
            ? customErrorMessage
            : isStartDate
              ? 'The start date must be earlier than the end date'
              : 'The end date must be later than the start date'
        )
      );
    },
  });
};
