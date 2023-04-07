import { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/lib/prisma'
import { withSessionRoute } from '@/lib/server'

export default withSessionRoute(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { address } = req?.session?.siwe
      if (!address) {
        return res.status(403).json({ ok: false, message: 'Unauthorized' })
      }
      const data = await prisma.card.update({
        where: {
          id: req.body.id,
        },
        data: {
          // @ts-ignore
          isClaimed: req.body.isClaimed,
          claimedReceipt: req.body.claimedReceipt,
          claimedHash: req.body.claimedHash,
          revokedHash: req.body.revokedHash,
          isRevoked: req.body.isRevoked,
          revokedReceipt: req.body.revokedReceipt,
        },
      })
      return res.json({ content: data, object: 'Delegation' })
    } catch (ex) {
      console.error(ex)
      return res.json({ ok: false })
    }
  }

  res.setHeader('Allow', ['POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
})
