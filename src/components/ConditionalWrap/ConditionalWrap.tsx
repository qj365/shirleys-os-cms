import type { PropsWithChildren } from 'react';

type ConditionalWrapProps = {
  condition: boolean;
  // eslint-disable-next-line
  wrap: (children: any) => any;
} & PropsWithChildren;

const ConditionalWrap = ({
  condition,
  wrap,
  children,
}: ConditionalWrapProps) => (condition ? wrap(children) : children);

export default ConditionalWrap;
