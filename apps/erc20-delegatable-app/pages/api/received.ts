import { NextApiRequest, NextApiResponse } from 'next'

import { withSessionRoute } from '../../lib/server'
import { prisma } from '@/lib/prisma'

export default withSessionRoute(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { address } = req?.session?.siwe
      if (!address) {
        return res.status(403).json({ ok: false, message: 'Unauthorized' })
      }

      const cards = await prisma.card.findMany({
        where: {
          to: address,
          isClaimed: false,
        },
      })

      return res.json({ content: cards, Object: 'Cards' })
    } catch (ex) {
      return res.json({ ok: false })
    }
  }

  res.setHeader('Allow', ['GET'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
})
