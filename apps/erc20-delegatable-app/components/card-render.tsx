import * as React from 'react'

import classNames from 'clsx'
import { utils } from 'ethers'

import { EnsName } from './ui/EnsName'

import expiredImage from '@/assets/images/expired.png'
import Image from 'next/image'

interface CardRenderProps {
  className?: string
  to?: string
  decimals?: number
  amount: number
  label: string
  expired?: boolean
}

export const CardRender = ({ className, to, decimals, amount, label, expired }: CardRenderProps) => {
  const classes = classNames(className, 'CardRender')
  return (
    <div className={classes}>
      <div className="card-blue">
        {expired && <Image className='absolute right-8 bottom-6 z-10 h-24 w-40' src={expiredImage} alt="Expired" width={100} height={100} />}
        <div className="absolute right-0 top-6 z-0 h-48 w-48 bg-[url('https://cryptologos.cc/logos/usd-coin-usdc-logo.png')] bg-cover opacity-10"></div>
        <div className="flex flex-1 justify-between">
          <div className="">
            <h3 className="text-4xl font-normal lg:text-6xl">{utils.formatUnits(amount, decimals)}</h3>
            <span className="text-xs">USDC Amount</span>
          </div>
        </div>
        <div className="">
          <div className="">
            <span className="text-xs">
              <span className="font-bold">{label}</span> <br />
              <EnsName address={to as `0x${string}`} truncate className="text-sm" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardRender
