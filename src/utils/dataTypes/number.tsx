import clsx from 'clsx';

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en').format(value);

export const formatDisplayedAmountWithMathNotation = (
  amount: unknown,
  suffix?: string
) => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '-';

  return (
    <span
      className={clsx(
        'font-bold',
        amount > 0 && 'text-green-500',
        amount < 0 && 'text-red-500'
      )}
    >
      {amount > 0 && '+'}
      {amount.toLocaleString()}
      {suffix && (
        <strong className="text-[--text-color-default]">{` ${suffix}`}</strong>
      )}
    </span>
  );
};

export const formatDisplayedNumber = (number: number | string) => {
  const nf = new Intl.NumberFormat('en-US');
  return nf.format(Number(number));
};

export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(num);
};
