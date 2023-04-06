import React, { useEffect } from 'react'

import { useWaitForTransaction } from 'wagmi'

import { WalletConnect } from './blockchain/wallet-connect'
import { BranchIsAuthenticated } from './shared/branch-is-authenticated'
import { BranchIsWalletConnected } from './shared/branch-is-wallet-connected'
import { ButtonSIWELogin } from '@/integrations/siwe/components/button-siwe-login'
import { appCardUpdate } from '@/lib/app/app-card-update'
import { useErc20ManagerRevoke } from '@/lib/blockchain'
import { useContractAutoLoad } from '@/lib/hooks/use-contract-auto-load'
import { useToast } from '@/lib/hooks/use-toast'

export function ButtonRevokeCard({ cid, delegation, signature }: any) {
  const { toast } = useToast()

  const handleRevoke = async (data: any) => {
    if (!contract) return
    if (!write) return
    write()
  }

  const contract = useContractAutoLoad('ERC20Manager')
  // @ts-ignore
  const { write, data, error, isLoading } = useErc20ManagerRevoke({
    address: contract?.address,
    args: [
      {
        delegation: delegation,
        signature: signature,
      },
    ],
  })

  useEffect( () => { 
    if(error) {
      toast({
        variant: "destructive",
        title: "Transaction Error",
        description: error.message || "The transaction has failed.",
      })
    }
  }, [error])

  useEffect(() => {
    appCardUpdate({
      id: cid,
      revokedHash: data?.hash as `0x${string}`,
    })
  }, [data])

  const { isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  useEffect(() => {
    if (isSuccess) {
      appCardUpdate({
        id: cid,
        isRevoked: true,
      })
    }
  }, [isSuccess])

  return (
    <div className="">
      <BranchIsAuthenticated>
        <BranchIsWalletConnected>
          <>
            {isLoading ? <button type="button" className="btn btn-red w-full">
                Revoking...
              </button> : null}
            {isSuccess ? <div className="text-green-500">Revoked</div>: null}
            {!isSuccess && !isLoading ? (
              <button type="button" className="btn btn-red w-full" onClick={handleRevoke}>
                Revoke
              </button>
            ): null
            }
          </>
          <WalletConnect />
        </BranchIsWalletConnected>
        <ButtonSIWELogin className="btn btn-sm btn-emerald" label="Web3 Login" />
      </BranchIsAuthenticated>
    </div>
  )
}
