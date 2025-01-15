import React from 'react'

import './EmptyGraphMessage.css'

export default function EmptyGraphMessage ({ children }: React.PropsWithChildren) {
    return <div className='empty-data-msg'>
        {children}
    </div>
}