import { Button } from "@mui/material"

import './GraphFooter.css'

export interface GraphFooterProps {
    dataLink: string;
}

export default function GraphFooter ({
    dataLink, 
}: GraphFooterProps) {
    return (
        <div className='graph-footer'>
            <Button
                className='full-data-btn'
                variant="outlined"
                href={dataLink}
                target='_blank'
                rel='noreferrer'
            >{'Full Data >>'}</Button>
        </div>
    )
}