/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

import { siteConfig } from '@/config/site'

export const config = {
  runtime: 'experimental-edge',
}

const sfPro = fetch(new URL('../../assets/fonts/SF-Pro-Display-Medium.otf', import.meta.url)).then((res) => res.arrayBuffer())

export default async function handler(req: NextRequest) {
  const [sfProData] = await Promise.all([sfPro])

  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || siteConfig.name
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          backgroundImage: 'linear-gradient(to bottom right, #FFF 25%, #FFF0CA 75%)',
        }}>
        <img src={new URL('../../public/logo-fill.png', import.meta.url).toString()} alt="TurboETH Logo" tw="w-20 h-20 mb-4 opacity-95" />
        <h1
          style={{
            fontSize: '100px',
            fontFamily: 'SF Pro',
            fontWeight: 900,
            background: 'linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: '8rem',
            letterSpacing: '-0.02em',
          }}>
          {siteConfig.name}
        </h1>
        <h3
          style={{
            fontSize: '22px',
            fontFamily: 'SF Pro',
            background: 'linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: '5rem',
            letterSpacing: '-0.02em',
            paddingTop: '1rem',
          }}>
          {siteConfig.description}
        </h3>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'SF Pro',
          data: sfProData,
        },
      ],
    }
  )
}
