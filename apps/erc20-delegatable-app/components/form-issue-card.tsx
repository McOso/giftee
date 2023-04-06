import React, { useState } from 'react'

import { BigNumber, ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import * as yup from 'yup'

import { WalletConnect } from './blockchain/wallet-connect'
import { BranchIsAuthenticated } from './shared/branch-is-authenticated'
import { BranchIsWalletConnected } from './shared/branch-is-wallet-connected'
import { ButtonSIWELogin } from '@/integrations/siwe/components/button-siwe-login'
import { appCardIssue } from '@/lib/app/app-card-issue'
import { appUserUpdate } from '@/lib/app/app-user-update'
import { useErc20Manager, useErc20PermitAllowance, useErc20PermitNonces } from '@/lib/blockchain'
import { useContractAutoLoad } from '@/lib/hooks/use-contract-auto-load'
import { useYupValidationResolver } from '@/lib/useYupValidationResolver'
import { createDelegation } from '@/lib/utils/create-delegation'
import { createSalt } from '@/lib/utils/create-salt'
import { getPermitSignature } from '@/lib/utils/get-permit-signature'

const validationSchema = yup.object({
  to: yup.string().required('Required'),
  amount: yup.string().required('Required'),
})

export function FormIssueCard() {
  const resolver = useYupValidationResolver(validationSchema)
  const { handleSubmit, register, setValue, setError, ...rest } = useForm({ resolver })

  const [isSubmitting, setIsSubmitting] = useState<Boolean>(false)
  const [signatures, setSignatures] = useState<any>()

  const contract = useContractAutoLoad('ERC20Manager')
  const managerContract = useErc20Manager({ address: contract?.address })

  const contractAllowanceEnforcer = useContractAutoLoad('ERC20FromAllowanceEnforcer')
  const contractTimestampBeforeEnforcer = useContractAutoLoad('TimestampBeforeEnforcer')
  const contractTimestampAfterEnforcer = useContractAutoLoad('TimestampAfterEnforcer')

  const contractUSDCAddress = useContractAutoLoad('USDC')

  const { address: issuerAddress } = useAccount()

  const { data: permitNonce } = useErc20PermitNonces({ address: contractUSDCAddress?.address, args: [issuerAddress as `0x${string}`] })

  const { data: allowance } = useErc20PermitAllowance({
    address: contractUSDCAddress?.address,
    args: [issuerAddress as `0x${string}`, contract?.address],
  })

  const { chain } = useNetwork()
  const signer = useSigner()

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)

    // check if valid send to address
    if (!ethers.utils.isAddress(data.to)) {
      setError('to', { type: 'manual', message: 'Invalid address' })
      setIsSubmitting(false)
      return false
    }

    const rawUSDCAmount = BigNumber.from(data.amount * 10 ** 6)

    const inputTerms = ethers.utils.hexZeroPad(rawUSDCAmount.toHexString(), 32)

    const salt = await createSalt(signer?.data as ethers.Signer)

    const termsWithSalt = ethers.utils.hexConcat([inputTerms, salt])

    const enforcers = [
      {
        enforcer: contractAllowanceEnforcer.address,
        terms: termsWithSalt,
      },
    ]

    // check if times are inputted
    if (data.startDate) {
      // handle start date enforcer
      const time = new Date(data.startDate).getTime() / 1000
      const timestampAfterRawValue = ethers.utils.hexZeroPad(ethers.utils.hexValue(time), 8)

      enforcers.push({
        enforcer: contractTimestampAfterEnforcer.address,
        terms: timestampAfterRawValue,
      })
    }

    if (data.endDate) {
      // handle end date enforcer
      const time = new Date(data.endDate).getTime() / 1000
      const timestampBeforeRawValue = ethers.utils.hexZeroPad(ethers.utils.hexValue(time), 8)
      enforcers.push({
        enforcer: contractTimestampBeforeEnforcer.address,
        terms: timestampBeforeRawValue,
      })
    }

    // @TODO - Sign the delegation
    const method = 'eth_signTypedData_v4'

    const me = await signer.data?.getAddress()

    let signature: any

    const allowanceAmount = BigNumber.from(1000 * 10 ** 6)
    if (!allowance || allowance.isZero() || allowance.lt(rawUSDCAmount)) {
      const sig = await getPermitSignature(
        signer.data,
        { address: contractUSDCAddress.address },
        contract.address,
        allowanceAmount,
        BigNumber.from(1990549033),
        'USD Coin (PoS)',
        permitNonce as BigNumber
      )

      const approveTrxPopulated = await managerContract?.populateTransaction.approveTransferProxy(
        contractUSDCAddress.address,
        me as `0x${string}`,
        allowanceAmount,
        BigNumber.from(1990549033),
        sig.v,
        sig.r as `0x${string}`,
        sig.s as `0x${string}`
      )
      signature = sig

      appUserUpdate({ allowanceTrx: approveTrxPopulated?.data })
    }

    const delegation = createDelegation(data.to, contract.address, chain?.id as number, enforcers)
    // @ts-ignore
    const signedDelegation = await signer.data?.provider?.send(method, [me, delegation.string])

    setSignatures({
      delegation: signedDelegation,
      invocation: '',
    })
    // @TODO - Send the data to the blockchain

    const formData = {
      from: me,
      to: data.to,
      token: 'USDC',
      decimals: '6',
      amount: rawUSDCAmount.toString(),
      delegations: {
        ...delegation,
        signedDelegation: signedDelegation,
      },
      signature,
    }
    appCardIssue(formData)
    setIsSubmitting(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full gap-10">
          <div className="mb-6 w-2/3">
            <label htmlFor="to" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              To
            </label>
            <input
              {...register('to')}
              type="text"
              id="to"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0xd61FA937b8f648901D354f48f6b14995fE468bF3"
              required
            />
            {rest.formState.errors.to && <p className="text-xs italic text-red-500">{rest.formState.errors.to.message as string}</p>}
          </div>
          <div className="mb-6 w-1/3">
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Amount of USDC
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              id="amount"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="100"
              required
            />
          </div>
        </div>
        <div className="flex w-full gap-10">
          <div className="mb-6 w-1/2">
            <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Start Date
            </label>
            <input
              {...register('startDate')}
              type="datetime-local"
              id="startDate"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder=""
            />
            <p className="mt-2 text-xs text-gray-500">Leave empty and the card will be available immediately.</p>
          </div>
          <div className="mb-6 w-1/2">
            <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              End Date
            </label>
            <input
              {...register('endDate')}
              type="datetime-local"
              id="endDate"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder=""
            />
            <p className="mt-2 text-xs text-gray-500">Leave empty and the card will be available forever.</p>
          </div>
        </div>

        <div className="">
          <BranchIsAuthenticated>
            <BranchIsWalletConnected>
              {rest.formState.isSubmitted ? (
                <button type="button" className="btn btn-emerald btn-lg w-full">
                  Card Sent 🥳
                </button>
              ) : (
                <button type="submit" className="btn btn-emerald w-full text-center">
                  {rest.formState.isSubmitting || isSubmitting ? (
                    <svg className="h-5 w-5 animate-spin mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"></path>
                    </svg>
                  ) : (
                    'Send Crypto Card'
                  )}
                </button>
              )}
              <WalletConnect />
            </BranchIsWalletConnected>
            <ButtonSIWELogin className="btn btn-sm btn-emerald" label="Web3 Login" />
          </BranchIsAuthenticated>
        </div>
      </form>
    </>
  )
}
