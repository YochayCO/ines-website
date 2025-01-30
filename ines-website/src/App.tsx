import InfoExpander from './components/InfoExpander/InfoExpander';
import Plotter from './components/Plotter/Plotter'
import CarrdLogo from './assets/images/carrd-logo-hebrew.png'
import InesLogo from './assets/images/ines-logo.jpg'

import './App.css'

function App() {
  return (
    <div className='app'>
      <div className='app-header'>
        <div className="logos">
          <a href="https://socsci4.tau.ac.il/mu2/ines/" className="ines-logo">
            <img src={InesLogo} alt="INES logo" />
          </a>
          {/* "https://carrd-english-cms.tau.ac.il/" */}
          <img src={CarrdLogo} alt="CARRD logo" className="carrd-logo" />
        </div>
        <h2>Welcome to the Israel National Election Studies interactive interface!</h2>
        <p className="app-description">
          The purpose of this interface is to allow easy access to the INES data.
          You can use it to plot the distributions of individual variables included in our dada, or joint distributions of two variables.
          <br/>
          The interface offers access to all of the INES surveys conducted since the project’s inception in 1969.
          To download the data and additional documentation, please follow the following <a href='https://socsci4.tau.ac.il/mu2/ines/data/our-data/'>link</a>.
        </p>
        <InfoExpander>How does it work?</InfoExpander>
      </div>
      <Plotter />
    </div>
  )
}

export default App
