import * as React from 'react'

import classNames from 'clsx'
import { utils } from 'ethers'

import { EnsName } from './ui/EnsName'

interface CardRenderProps {
  className?: string
  to?: string
  decimals?: number
  amount: number
  label: string
}

export const CardRender = ({ className, to, decimals, amount, label }: CardRenderProps) => {
  const classes = classNames(className, 'CardRender')
  return (
    <div className={classes}>
      <div className="card-blue">
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
