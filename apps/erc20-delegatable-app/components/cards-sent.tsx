import * as React from 'react'

import classNames from 'clsx'
import { ethers, utils } from 'ethers'

import { ButtonRevokeCard } from './button-revoke-card'
import CardRender from './card-render'
import TimeFromEpoch from './shared/time-from-epoch'
import { TimeFromUtc } from './shared/time-from-utc'
import { Dialog, DialogContentXL, DialogTrigger } from './ui/dialog'
import { EnsName } from './ui/EnsName'
import { useAppUserCardsSent } from '@/lib/hooks/app/use-app-users-cards-sent'
import { useContractAutoLoad } from '@/lib/hooks/use-contract-auto-load'

interface CardsSentProps {
  className?: string
}

export const CardsSent = ({ className }: CardsSentProps) => {
  const classes = classNames(className, 'CardsSent')
  const { data } = useAppUserCardsSent()
  const contractTimestampBeforeEnforcer = useContractAutoLoad('TimestampBeforeEnforcer')
  const contractTimestampAfterEnforcer = useContractAutoLoad('TimestampAfterEnforcer')

  return (
    <>
      {data?.content?.map((received, index) => {
        let startTime
        let endTime
        received?.delegations?.delegation?.caveats.forEach((caveat: any) => {
          if (caveat?.enforcer === contractTimestampBeforeEnforcer?.address) {
            endTime = ethers.BigNumber.from(caveat?.terms).toNumber()
          }
          if (caveat?.enforcer === contractTimestampAfterEnforcer?.address) {
            startTime = ethers.BigNumber.from(caveat?.terms).toNumber()
          }
        })
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
                    <DialogContentXL className="h-screen overflow-y-auto sm:max-h-[550px] md:p-10">
                      <div className="grid grid-cols-12 md:gap-x-10">
                        <div className="col-span-12 mb-2 md:col-span-5">
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
                        <div className="col-span-12 md:col-span-7">
                          <CardRender to={received.to} amount={received.amount} decimals={received.decimals} label="to" />
                          <div className="my-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">Start</span>
                              <span className="text-xs">
                                {startTime ? <TimeFromEpoch epoch={startTime} /> : <TimeFromUtc date={received?.createdAt} />}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-xs font-semibold">Expiration</span>
                              <span className="text-xs">{endTime ? <TimeFromEpoch epoch={endTime} /> : 'Never'}</span>
                            </div>
                          </div>
                          <ButtonRevokeCard
                            cid={received?.id}
                            signature={received?.delegations?.signedDelegation}
                            delegation={received?.delegations?.delegation}
                          />
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
                    <EnsName address={received.to} truncate className="text-sm" />
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
