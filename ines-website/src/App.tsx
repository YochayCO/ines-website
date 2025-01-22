import { useState } from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import InfoExpander from './components/InfoExpander/InfoExpander';
import Plotter from './components/Plotter/Plotter'

import './App.css'

function App() {
  const [isFullscreen, setFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenEnabled) {
      console.log('fullscreen option not enabled')
      return
    }

    // Avoiding useEffect because first render should not trigger fullscreen
    setFullscreen((isFull) => {
      if (isFull) {
        // Should alread be full
        if (document.fullscreenElement) document.exitFullscreen()
          return false
      } else {
        // Should not be full
        if (!document.fullscreenElement) document.documentElement.requestFullscreen()
        return true
      }
    })
  }

  const fullscreenButtonProps = {
    fontSize: 'large' as const,
    className: 'fullscreen-button',
    onClick: toggleFullscreen
  }

  return (
    <div className='app'>
      <div className='app-header'>
        <h1>Playground</h1>
        <InfoExpander />
      </div>
      <Plotter />
      {isFullscreen 
        ? <FullscreenExitIcon {...fullscreenButtonProps} /> 
        : <FullscreenIcon {...fullscreenButtonProps} />
      }
    </div>
  )
}

export default App
