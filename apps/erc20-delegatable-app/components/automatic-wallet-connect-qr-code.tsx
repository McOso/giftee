import * as React from 'react'

import classNames from 'clsx'
import QRCode from 'react-qr-code'

interface AutomaticWalletConnectQRCodeProps {
  className?: string
  qrCode?: string
}

export const AutomaticWalletConnectQRCode = ({ className, qrCode }: AutomaticWalletConnectQRCodeProps) => {
  const classes = classNames(className, 'AutomaticWalletConnectQRCode')
  return (
    <div className={classes}>
      <QRCode value={qrCode || ''} className="max-h-[208px] w-full cursor-pointer rounded-xl bg-white p-4 shadow-md hover:shadow-lg" />
    </div>
  )
}

export default AutomaticWalletConnectQRCode
