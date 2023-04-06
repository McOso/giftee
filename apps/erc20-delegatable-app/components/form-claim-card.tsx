import React, { useEffect, useState } from 'react'

import { BigNumber, ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useNetwork, useSigner, useWaitForTransaction } from 'wagmi'
import * as yup from 'yup'

import { WalletConnect } from './blockchain/wallet-connect'
import { BranchIsAuthenticated } from './shared/branch-is-authenticated'
import { BranchIsWalletConnected } from './shared/branch-is-wallet-connected'
import { ButtonSIWELogin } from '@/integrations/siwe/components/button-siwe-login'
import { appCardUpdate } from '@/lib/app/app-card-update'
import { useErc20Manager, useErc20ManagerInvoke, useErc20PermitAllowance } from '@/lib/blockchain'
import { useAppGetUser } from '@/lib/hooks/app/use-app-get-user'
import { useContractAutoLoad } from '@/lib/hooks/use-contract-auto-load'
import { useYupValidationResolver } from '@/lib/useYupValidationResolver'
import { createIntention } from '@/lib/utils/create-intention'
import { useToast } from '@/lib/hooks/use-toast'



const validationSchema = yup.object({
  to: yup.string(),
})

interface FormClaimCardProps {
  cid: string
  delegationData: any
}

export function FormClaimCard({ cid, delegationData }: FormClaimCardProps) {
  const { toast } = useToast()
  const resolver = useYupValidationResolver(validationSchema)
  const { handleSubmit, register, setError, formState, reset } = useForm({ resolver })

  const [intentionData, setIntentionData] = useState<any>()

  const contract = useContractAutoLoad('ERC20Manager')
  const managerContract = useErc20Manager({ address: contract?.address })

  const contractUSDC = useContractAutoLoad('USDC')

  const { chain } = useNetwork()
  const signer = useSigner()

  const { data: issuerUserData } = useAppGetUser(delegationData.from)


  const { data: allowance } = useErc20PermitAllowance({
    address: contractUSDC?.address,
    args: [delegationData.from as `0x${string}`, contract?.address],
  })

  const { write, data, isError, error, ...rest } = useErc20ManagerInvoke({
    address: contract.address,
    args: [[intentionData]],
    overrides: { gasLimit: BigNumber.from(1000000) },
    // @ts-ignore
    enabled: Boolean(intentionData),
  })

  useEffect(() => {
    appCardUpdate({
      id: cid,
      claimedHash: data?.hash as `0x${string}`,
    })
  }, [data])

useEffect( () => { 
  if(error) {
    reset()
    toast({
      title: "Transaction Error",
      description: "The transaction has failed.",
    })
  }
}, [error])

  const { isSuccess, data: receipt } = useWaitForTransaction({
    hash: data?.hash,
  })

  useEffect(() => {
    if (isSuccess) {
      appCardUpdate({
        id: cid,
        isClaimed: true,
        claimedReceipt: receipt,
      })
    }
  }, [isSuccess])

  const onSubmit = async (data: any) => {
    // check if valid send to address
    if (data.to && !ethers.utils.isAddress(data.to)) {
      setError('to', { type: 'manual', message: 'Invalid address' })
      return false
    }

    const sendToAddress = data.to ? data.to : await signer.data?.getAddress()
    const method = 'eth_signTypedData_v4'

    let approveTrxPopulated: string | undefined = undefined
    if (issuerUserData?.content?.allowanceTrx && (allowance?.isZero() || allowance?.lt(delegationData.amount))) {
      approveTrxPopulated = issuerUserData?.content?.allowanceTrx
    }

    const transferTrxPopulated = await managerContract?.populateTransaction.transferProxy(contractUSDC.address, sendToAddress, delegationData.amount)

    const intention = createIntention(
      sendToAddress,
      delegationData.delegations.delegation,
      delegationData.delegations.signedDelegation,
      contract.address,
      transferTrxPopulated?.data as string,
      chain?.id as number,
      approveTrxPopulated
    )
    // @ts-ignore
    try {
      const signedIntention = await signer.data?.provider.send(method, [await signer.data?.getAddress(), intention.string])
      setIntentionData({ invocations: { ...intention.intention }, signature: signedIntention })
    } catch (error) {
      toast({
        title: "Signature Rejected",
        description: "You have rejected the signature request.",
      })
    }
  }


  useEffect(() => {
    if (intentionData && write) {
      write()
    }
  }, [intentionData])


  useEffect( () => { 
    if(formState.isSubmitSuccessful && isError) {
      reset()
    }
  }, [isError])

  useEffect( () => { 
    if(formState.isSubmitSuccessful && isSuccess) {
      reset()
    }
  }, [formState.isSubmitSuccessful])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full gap-10">
        <div className="mb-6 w-full">
          <label htmlFor="to" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Send To
          </label>
          <input
            {...register('to')}
            type="text"
            id="name"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="0x000...000"
          />
          {formState.errors.to && <p className="text-xs italic text-red-500">{formState.errors.to.message as string}</p>}
          <p className="mt-2 text-center text-xs">Leave this field blank if you want to claim your USDC to your wallet.</p>
        </div>
      </div>

      <div className="">
        <BranchIsAuthenticated>
          <BranchIsWalletConnected>
            {formState.isSubmitted ? (
              <button type="button" className="btn btn-emerald w-full">
                {
                  isSuccess ? (
                    <span className=''>Complete</span>
                  ) : (
                    <div className='flex items-center justify-center gap-3 w-full'><span className=''>Executing transaction</span><svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"></path>
                  </svg></div>
                  ) 
                }
              </button>
            ) : (
              <button type="submit" className="btn btn-emerald w-full">
                {formState.isSubmitting ? (
                  <svg className="mx-auto h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"></path>
                  </svg>
                ) : (
                  'Claim'
                )}
              </button>
            )}
            <WalletConnect />
          </BranchIsWalletConnected>
          <ButtonSIWELogin className="btn btn-sm btn-emerald" label="Web3 Login" />
        </BranchIsAuthenticated>
      </div>
    </form>
  )
}
