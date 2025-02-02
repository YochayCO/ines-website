import MobileWarningIcon from '@mui/icons-material/SecurityUpdateWarning';
import InfoExpander from './components/InfoExpander/InfoExpander';
import Plotter from './components/Plotter/Plotter'
import CarrdLogo from './assets/images/carrd-logo-hebrew.png'
import InesLogo from './assets/images/ines-logo.png'

import './App.css'

function App() {
  return (
    <div className='app'>
      <div className='app-header'>
        <div className="logos">
          <a href="https://socsci4.tau.ac.il/mu2/ines/" target="_blank" className="ines-logo">
            <img src={InesLogo} alt="INES logo" />
          </a>
          <a href="https://carrd-english-cms.tau.ac.il/" target="_blank" className="carrd-logo">
            <img src={CarrdLogo} alt="CARRD logo" />
          </a>
        </div>
        <h2>Welcome to the Israel National Election Studies interactive interface!</h2>
        <p className="app-description">
          The purpose of this interface is to allow easy access to the INES data.
          You can use it to plot the distributions of individual variables included in our dada, or joint distributions of two variables.
          <br/>
          The interface offers access to all of the INES surveys conducted since the project’s inception in 1969.
          To download the data and additional documentation, please follow the following <a href='https://socsci4.tau.ac.il/mu2/ines/data/our-data/' target='_blank'>link</a>.
        </p>
        <InfoExpander>How does it work?</InfoExpander>
        <div className="mobile-info">
          <MobileWarningIcon />
          <span>
            <b>The interface is not built for mobile devices!</b> Use your desktop browser
          </span>
        </div>
      </div>
      <Plotter />
    </div>
  )
}

export default App
