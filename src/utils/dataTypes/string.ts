import { message } from 'antd';

export const trimmedSpacesKeyword = (keyword?: string) => {
  if (!keyword) return '';
  return keyword.trim().replace(/ +(?= )/g, '');
};

export const isHEXColor = (color: string) => {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
};

export const hexToRgba = (hex: string, alpha: number): string => {
  if (!isHEXColor) {
    throw new Error('Invalid hex color code');
  }

  let c: string | number[] | (string | number)[] = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + (c as number[]).join('');

  const r = (parseInt(c as string, 16) >> 16) & 255;
  const g = (parseInt(c as string, 16) >> 8) & 255;
  const b = parseInt(c as string, 16) & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const convertHexToRgbaPair = (
  hex: string
): Record<'solid' | 'transparent', string> => {
  const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}([0-9A-Fa-f]{2})?$/;
  if (!hexColorRegex.test(hex)) {
    throw new Error('Invalid hex color.');
  }
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return {
    solid: `rgba(${r}, ${g}, ${b}, 1)`,
    transparent: `rgba(${r}, ${g}, ${b}, 0)`,
  };
};

export const formatDisplayCurrency = (
  price: number,
  currency = 'USD'
): string => {
  const config: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency || 'USD',
  };

  let locale: string;

  switch (currency) {
    case 'USD':
      locale = 'en-US';
      break;
    default:
      locale = 'en-US';
  }

  return price !== undefined
    ? new Intl.NumberFormat(locale, config).format(price)
    : '-';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toastErrorMessage = (error: any) => {
  console.log('Error: ', JSON.stringify(error || {}));
  void message.error(
    error?.body?.details ||
      error?.body?.message ||
      'An error occurred, please try again later.'
  );
};
