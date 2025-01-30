import { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import specialToggleExampleImg from '../../assets/images/special-toggle-example.png'
import sectorSelectExampleImg from '../../assets/images/sector-select-example.png'
import responsesExampleImg from '../../assets/images/responses-example.png'
import columnToggleExampleImg from '../../assets/images/column-toggle-example.png'
import autocompleteExampleImg from '../../assets/images/autocomplete-example.png'

import './InfoExpander.css'
import useIsFirstSession from '../../hooks/useIsFirstSession'

const autocompleteDescription = `You can search a specific survey / question by typing in the select box - it will auto-complete.`
const specialToggleDescription = <span>Use the <code>“include "Don’t know" answers”</code> toggle to include or exclude these responses from the reported percentages.</span>
const sectorDescription =<span>Clicking on the relevant <code>“Sector“</code> selector subsets the results based on respondents’ ethnic identity.
    Available only in recent surveys (since 2009).</span>
const responsesDescription = `The number of responses used for the plot is reported in the top right corner.`
const columnToggleDescription = `In joint distribution plots, clicking the boxes above columns excludes that variable level from the analysis.`
const technicalDataText = `The plotted data uses the survey weights included in each INES survey, when available.
    Please check the INES website for per-survey documentation and detailed information about survey representativeness and weighting procedures.`
const reopenOptionText = <i className='text'>
        {`You can always re-open this tutorial by clicking on the`}
        <InfoIcon className='icon-in-text' fontSize='small' />
        {`sign. The tutorial will not pop-up automatically the next time you open the interface from this browser.`}
    </i>

interface InfoExpanderProps {
    children: React.ReactNode
}

export default function InfoExpander ({ children }: InfoExpanderProps) {
    const isFirstSession = useIsFirstSession()
    const [isContentVisible, setContentVisible] = useState(false)
    const toggleContent = () => setContentVisible((isVisible) => !isVisible)

    useEffect(() => {
        if (isFirstSession) {
            setContentVisible(true)
        }
    }, [isFirstSession])

    return (
        <div className='info-expander'>
            <b className="expander-description">{children}</b>
            <IconButton className="expander-btn" onClick={toggleContent}>
                <InfoIcon className="expander-icon" />
            </IconButton>
            <Dialog
                open={isContentVisible}
                onClose={toggleContent}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    How to use the interactive interface?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="dialog-content" component='span'>
                        <h3>Getting started</h3>
                        First, choose a <code>survey year</code> from the drop-down menu.
                        Then, choose an "<code>X-axis</code>" question. This will plot the distribution of the chosen variable.
                        <br/>
                        To plot a joint distribution, choose a "<code>Y-axis</code>" question from the subsequent drop-down menu.

                        <br/><br/>
                        <div className='image-and-description'>
                            <div className='description'>{autocompleteDescription}</div>
                            <img src={autocompleteExampleImg} className='autocomplete-image image' />
                        </div>
                        <br/><br/>
                        <i>Please use the interface only from your desktop browser, for readability.</i>
                        <br/><br/>
                        <h3>More features</h3>
                        <div className='image-and-description'>
                            <div className='description'>{specialToggleDescription}</div>
                            <img src={specialToggleExampleImg} className='special-toggle-image image' />
                        </div>
                        <div className='image-and-description'>
                            <div className='description'>{sectorDescription}</div>
                            <img src={sectorSelectExampleImg} className='sector-select-image image' />
                        </div>
                        <div className='image-and-description'>
                            <div className='description'>{responsesDescription}</div>
                            <img src={responsesExampleImg} className='responses-image image' />
                        </div>
                        <div className='image-and-description'>
                            <div className='description'>{columnToggleDescription}</div>
                            <img src={columnToggleExampleImg} className='column-toggle-image image' />
                        </div>
                        <h3>Technical Data</h3>
                        {technicalDataText}
                        <br/><br/>
                        {reopenOptionText}
                        <br/><br/>
                        <h3>Want to report a bug?</h3>
                        All credits and complaints go to the developer:{' '}
                        <a href='mailto:yochayc@mail.tau.ac.il'>Yochay Cohen-Or</a>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={toggleContent} autoFocus>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}