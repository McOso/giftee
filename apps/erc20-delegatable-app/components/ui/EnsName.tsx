import * as React from 'react';
import classNames from 'clsx';
import { useEnsName } from 'wagmi';
import { Address } from '@turbo-eth/core-wagmi';

interface EnsNameProps {
  className?: string;
  address: `0x${string}`;
  truncate?: boolean;
  chainId?: number;
}

export const EnsName = ({
  className,
  address,
  truncate = false,
  chainId = 1,
}: EnsNameProps) => {
  const classes = classNames(className, 'EnsName');
  const { data, isSuccess } = useEnsName({
    address: address,
    chainId: chainId,
  });
  if (!data || !isSuccess) {
    return (
      <Address truncate={truncate} address={address} className={classes} />
    );
  }
  return <span className={classes}>{data}</span>;
};