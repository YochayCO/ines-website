import { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import specialToggleExampleImg from '../../assets/images/special-toggle-example.png'
import sectorSelectExampleImg from '../../assets/images/sector-select-example.png'
import responsesExampleImg from '../../assets/images/responses-example.png'
import columnToggleExampleImg from '../../assets/images/column-toggle-example.png'

import './InfoExpander.css'
import useIsFirstSession from '../../hooks/useIsFirstSession'

const specialToggleDescription = 'You can toggle special values (such as 98. other)'
const sectorDescription = 'In more recent surveys (since 2009), you can filter data by sector.'
const responsesDescription = `The number of responses for the resulted graph is displayed.
    Note that in some of the surveys use weights that improve the graph's accuracy.`
const columnToggleDescription = `In the tabulation graph you can click on the top squares to toggle
    the column and get a better grasp of the common distributions.`
const reopenOptionText = <span className='text'>
        {`Note that you can always re-open this tutorial by clicking on the`}
        <InfoIcon className='icon-in-text' fontSize='small' />
        {`sign. The tutorial will not pop-up automatically the next time you open the playground from this browser.`}
    </span>

export default function InfoExpander () {
    const isFirstSession = useIsFirstSession()
    const [isContentVisible, setContentVisible] = useState(false)
    const toggleContent = () => setContentVisible((isVisible) => !isVisible)

    useEffect(() => {
        if (isFirstSession) {
            setContentVisible(true)
        }
    }, [isFirstSession])

    return (
        <>
            <IconButton size='large' onClick={toggleContent}>
                <InfoIcon />
            </IconButton>
            <Dialog
                open={isContentVisible}
                onClose={toggleContent}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    How to use the playground?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" component='span'>
                        The playground is an interactive interface for the{' '}
                        <a href='https://socsci4.tau.ac.il/mu2/ines/data/our-data/'>INES data</a>.
                        Follow the link to view the original data and learn more about how it was collected.
                        <br/><br/><hr/><br/>
                        Choose a survey and a question to display its distribution.
                        <br/>
                        Choose two questions to display their common distribution.
                        <br/><br/>
                        You can search a specific survey / question by typing in the select box - it will auto-complete.
                        <br/><br/>
                        *Please use the playground only from your desktop browser.
                        <br/><br/>
                        <div className='image-and-description'>
                            <div className='description'>{specialToggleDescription}</div>
                            <img src={specialToggleExampleImg} className='special-toggle-image image' height={60} />
                        </div>
                        <div className='image-and-description'>
                            <div className='description'>{sectorDescription}</div>
                            <img src={sectorSelectExampleImg} className='sector-select-image image' height={60} />
                        </div>
                        <div className='image-and-description'>
                            <div className='description'>{responsesDescription}</div>
                            <img src={responsesExampleImg} className='responses-image image' height={60} />
                        </div>
                        <div className='image-and-description'>
                            <div className='description'>{columnToggleDescription}</div>
                            <img src={columnToggleExampleImg} className='column-toggle-image image' height={60} />
                        </div>
                        <br/><br/>
                        {reopenOptionText}
                        <br/><br/>
                        Want to report a bug? All credits and complaints go to the developer:{' '}
                        <a href='mailto:yochayc@mail.tau.ac.il'>Yochay Cohen-Or</a>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={toggleContent} autoFocus>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}