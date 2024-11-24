import Plotter from './components/Plotter/Plotter'
import './App.css'

function App() {
  const toggleFullscreen = () => {
    if (!document.fullscreenEnabled) {
      console.log('fullscreen option not enabled')
      return
    }

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  return (
    <div className='app'>
      <h1>INES Data Sandbox</h1>
        <Plotter />
      <div className='fullscreen-button' onClick={toggleFullscreen}>
        Toggle Fullscreen
      </div>
    </div>
  )
}

export default App
