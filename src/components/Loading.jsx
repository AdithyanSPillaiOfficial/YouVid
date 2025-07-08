import React from 'react'
import { HashLoader } from 'react-spinners'

function Loading() {

  return (
    <div className='fixed top-0 left-0 w-screen h-screen bg-black/60 flex items-center justify-center'>
        <HashLoader color='#c11e75' size={150}/>
    </div>
  )
}

export default Loading