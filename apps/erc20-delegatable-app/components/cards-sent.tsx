import * as React from 'react'

import classNames from 'clsx'
import { utils } from 'ethers'

import { useAppUserCardsSent } from '@/lib/hooks/app/use-app-users-cards-sent'

import { ButtonRevokeCard } from './button-revoke-card'
import CardRender from './card-render'
import { TimeFromUtc } from './shared/time-from-utc'
import { Dialog, DialogContentXL, DialogTrigger } from './ui/dialog'

interface CardsSentProps {
  className?: string
}

export const CardsSent = ({ className }: CardsSentProps) => {
  const classes = classNames(className, 'CardsSent')
  const { data } = useAppUserCardsSent()
  return (
    <>
      {data?.content?.map((received, index) => {
        return (
          <div key={index} className={classes}>
            <div className="card-blue">
              <div className="absolute right-0 top-6 z-0 h-48 w-48 bg-[url('https://cryptologos.cc/logos/usd-coin-usdc-logo.png')] bg-cover opacity-10" />
              <div className="z-10 flex flex-1 justify-between">
                <div className="">
                  <h3 className="text-4xl font-normal lg:text-6xl">{utils.formatUnits(received.amount, received.decimals)}</h3>
                  <span className="text-xs">USDC Amount</span>
                </div>
                <span className="">
                  <Dialog>
                    <DialogTrigger>
                      <button className="tag tag-light">Revoke</button>
                    </DialogTrigger>
                    <DialogContentXL className="lg:p-10">
                      <div className="grid grid-cols-12 lg:gap-x-10">
                        <div className="col-span-12 lg:col-span-5">
                          <h3 className="text-4xl font-normal">How It Works</h3>
                          <hr className="my-4" />
                          <div className="content text-xs">
                            <p className="font-semibold">You sent a friend a USDC gift card.</p>
                            <p className="">
                              Until the voucher is claimed, you can revoke it. This will prevent the recipient from claiming the voucher.
                            </p>
                            <p className="font-semibold">Do you have more questions?</p>
                            Go to the{' '}
                            <a className="link" href="https://delegatable.org" target="_blank" rel="noreferrer">
                              Delegatable framework documentation
                            </a>{' '}
                            to learn more.
                          </div>
                        </div>
                        <div className="col-span-12 lg:col-span-7">
                          <CardRender to={received.to} amount={received.amount} decimals={received.decimals} />
                          <div className="my-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">Start</span>
                              <span className="text-xs">
                                <TimeFromUtc date={received.createdAt} />
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-xs font-semibold">Expiration</span>
                              <span className="text-xs">None</span>
                            </div>
                          </div>
                          <ButtonRevokeCard signature={received?.delegations?.signedDelegation} delegation={received?.delegations?.delegation} />
                        </div>
                      </div>
                    </DialogContentXL>
                  </Dialog>
                </span>
              </div>
              <div className="">
                <div className="">
                  <span className="text-xs">
                    <span className="font-bold">to</span> <br />
                    {received.to}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default CardsSent
