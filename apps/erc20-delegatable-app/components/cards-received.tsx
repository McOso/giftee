import * as React from 'react'

import classNames from 'clsx'
import { ethers, utils } from 'ethers'
import Image from 'next/image'

import CardRender from './card-render'
import { FormClaimCard } from './form-claim-card'
import TimeFromEpoch from './shared/time-from-epoch'
import { TimeFromUtc } from './shared/time-from-utc'
import { Dialog, DialogContentXL, DialogTrigger } from './ui/dialog'
import { EnsName } from './ui/EnsName'
import expiredImage from '@/assets/images/expired.png'
import { useAppUserCardsReceived } from '@/lib/hooks/app/use-app-users-cards-received'
import { useContractAutoLoad } from '@/lib/hooks/use-contract-auto-load'

interface CardsReceivedProps {
  className?: string
}

export const CardsReceived = ({ className }: CardsReceivedProps) => {
  const classes = classNames(className, 'CardsReceived')
  const { data } = useAppUserCardsReceived()
  const contractTimestampBeforeEnforcer = useContractAutoLoad('TimestampBeforeEnforcer')
  const contractTimestampAfterEnforcer = useContractAutoLoad('TimestampAfterEnforcer')
  const contractAllowedAddressEnforcer = useContractAutoLoad('AllowedAddressEnforcer')

  return (
    <>
      {data?.content?.map((card, index) => {
        let startTime
        let endTime
        const allowedAddresses: string[] = []
        card?.delegations?.delegation?.caveats.forEach((caveat: any) => {
          if (caveat?.enforcer === contractTimestampBeforeEnforcer?.address) {
            endTime = ethers.BigNumber.from(caveat?.terms).toNumber()
          }
          if (caveat?.enforcer === contractTimestampAfterEnforcer?.address) {
            startTime = ethers.BigNumber.from(caveat?.terms).toNumber()
          }
          if (caveat?.enforcer === contractAllowedAddressEnforcer?.address) {
            // split terms into array of every 40 characters ie Addresses
            const cleanedTerms = caveat?.terms.replace(/0x/g, '')
            cleanedTerms.match(/.{1,40}/g)?.forEach((address: string) => {
              allowedAddresses.push('0x' + address)
            })
          }
        })

        const expired = endTime && endTime < Date.now() / 1000

        return (
          <div key={index} className={classes}>
            {/* <div className="bg-gradient-to-tr from-red-500 to-orange-500 text-white rounded-lg min-h-[245px] flex flex-col p-4"> */}
            <div className="card-blue">
              {expired && <Image className="absolute bottom-6 right-8 z-10 h-24 w-40" src={expiredImage} alt="Expired" width={100} height={100} />}
              <div className="absolute right-0 top-6 z-0 h-48 w-48 bg-[url('https://cryptologos.cc/logos/usd-coin-usdc-logo.png')] bg-cover opacity-10"></div>
              <div className="z-10 flex flex-1 justify-between">
                <div className="">
                  <h3 className="text-4xl font-normal lg:text-6xl">{utils.formatUnits(card.amount, card.decimals)}</h3>
                  <span className="text-xs">USDC Amount</span>
                </div>
                <span className="">
                  <Dialog>
                    <DialogTrigger>
                      <button className="tag tag-light">Claim</button>
                    </DialogTrigger>
                    <DialogContentXL className="h-screen overflow-y-auto pb-56 sm:max-h-[550px] md:p-8">
                      <div className="grid grid-cols-12 md:gap-x-10">
                        <div className="col-span-12 mb-2 md:col-span-5">
                          <h3 className="text-4xl font-normal">How It Works</h3>
                          <hr className="my-4" />
                          <div className="content text-xs">
                            <p className="font-semibold">A friend sent you USDC.</p>
                            <p className="">
                              You can claim your USDC by signing a message with your wallet. This message will be used to verify your identity and
                              claim your USDC.
                            </p>
                            <p className="font-semibold">Do you have more questions?</p>
                            Go to the{' '}
                            <a className="link" href="https://delegatable.org" target="_blank" rel="noreferrer">
                              Delegatable framework documentation
                            </a>{' '}
                            to learn more.
                          </div>
                          {allowedAddresses && allowedAddresses.length > 0 && (
                            <div className="content mt-4 text-base">
                              <hr />
                              <p className="mt-2 font-bold">Allowed Spending Addresses</p>
                              <p className="text-xs">These are the only addresses where you can spend your USDC Giftee Card.</p>
                              {allowedAddresses.map((address, index) => {
                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    <span className="text-xs font-semibold">{index + 1}</span>
                                    <EnsName address={address as `0x${string}`} className="text-xs" />
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-7">
                          <CardRender to={card.from} amount={card.amount} decimals={card.decimals} label="from" expired={expired} />
                          <div className="my-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">Start</span>
                              <span className="text-xs">
                                {startTime ? <TimeFromEpoch epoch={startTime} /> : <TimeFromUtc date={card.createdAt} />}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-xs font-semibold">Expiration</span>
                              <span className="text-xs">{endTime ? <TimeFromEpoch epoch={endTime} /> : 'Never'}</span>
                            </div>
                          </div>
                          <FormClaimCard cid={card.id} delegationData={card} />
                        </div>
                      </div>
                    </DialogContentXL>
                  </Dialog>
                </span>
              </div>
              <div className="">
                <div className="">
                  <span className="text-xs">
                    <span className="font-bold">from</span> <br />
                    <EnsName address={card.from} truncate className="text-sm" />
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

export default CardsReceived
