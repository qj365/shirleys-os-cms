import type { FormItemProps, InputNumberProps, InputRef } from 'antd';
import { Form, Input, Tooltip } from 'antd';
import type { Rule } from 'rc-field-form/es/interface';
import React, { useCallback, useMemo } from 'react';
import { formatNumber } from 'utils/dataTypes/number';

type NumericTooltipInputProps = {
  tooltipMsg?: string;
  formProps: FormItemProps & {
    /** Use this to bind the correct field name for useWatch*/
    watcher?: Array<string | number>;
  };
  inputProps?: InputNumberProps;
  min?: number;
  max?: number;
  ref?: React.RefObject<InputRef>;
};

const { useFormInstance, useWatch } = Form;

const reg = /^-?\d*(\.\d*)?$/;

/** Use this component to display tooltip that contain thousand separator that displayed when typing */
const NumericTooltipInput = ({
  tooltipMsg,
  formProps: {
    name,
    label,
    rules,
    className: formClassName,
    watcher,
    tooltip: labelTooltip,
  },
  inputProps,
  min,
  max,
  ref,
}: NumericTooltipInputProps) => {
  const form = useFormInstance();
  const { setFieldValue } = form;

  const {
    suffix,
    placeholder,
    className: inputClassName,
    disabled,
    addonBefore,
    addonAfter,
  } = inputProps || {};

  const value = useWatch(watcher || name, form) ?? '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: inputValue } = e.target;
      if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
        setFieldValue(name, inputValue);
      }
    },
    [name, setFieldValue]
  );

  const handleBlur = useCallback(() => {
    let valueTemp = value.toString();
    if (value.toString().charAt(value.length - 1) === '.' || value === '-') {
      valueTemp = value.slice(0, -1);
    }
    setFieldValue(name, valueTemp.replace(/0*(\d+)/, '$1'));
  }, [name, setFieldValue, value]);

  const title = useMemo(
    () =>
      value ? (
        <span className="inline-block min-w-5 text-center">
          {value !== '-' ? formatNumber(Number(value)) : '-'}
        </span>
      ) : (
        (tooltipMsg ?? 'Input Number')
      ),
    [tooltipMsg, value]
  );

  return (
    <Tooltip
      trigger={['focus']}
      title={title}
      placement="topLeft"
      openClassName="numeric-input"
    >
      <div className={formClassName}>
        <Form.Item
          name={name}
          label={label}
          rules={[
            {
              validator: (_, value) => {
                if (value && !reg.test(value)) {
                  return Promise.reject('Please Input a Number');
                }
                if (min !== undefined && parseInt(value) < min) {
                  return Promise.reject(
                    `Please enter a value greater than ${min}`
                  );
                }
                if (max !== undefined && parseInt(value) > max) {
                  return Promise.reject(
                    `Please enter a value less than ${max}`
                  );
                }
                return Promise.resolve();
              },
            },
            ...(rules || ([] as Rule[])),
          ]}
          className="w-full"
          tooltip={labelTooltip}
        >
          <Input
            ref={ref}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={16}
            className={inputClassName ?? ''}
            suffix={suffix ?? ''}
            disabled={disabled}
            addonBefore={addonBefore}
            addonAfter={addonAfter}
          />
        </Form.Item>
      </div>
    </Tooltip>
  );
};

export default NumericTooltipInput;
