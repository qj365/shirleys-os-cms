import type { Rule } from 'rc-field-form/es/interface';

export enum FORM_FIELD {
  USERNAME = 'userName',
  PASSWORD = 'password',
}

export const FormLabels: Record<FORM_FIELD, string> = Object.freeze({
  [FORM_FIELD.USERNAME]: 'Username',
  [FORM_FIELD.PASSWORD]: 'Password',
});

export const FormValidations: Partial<Record<FORM_FIELD, Rule[]>> =
  Object.freeze({
    [FORM_FIELD.USERNAME]: [{ required: true, whitespace: true }],
    [FORM_FIELD.PASSWORD]: [{ required: true, whitespace: true }],
  });
