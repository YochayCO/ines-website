import { IconButton } from "@mui/material";
import ScreenshotIcon from '@mui/icons-material/FitScreen';

export default function ExportButton ({ exportGraph, exportButtonRef }: { exportGraph: () => void, exportButtonRef: React.RefObject<HTMLButtonElement> }) {

    return (
        <IconButton
            id="export-button"
            ref={exportButtonRef}
            onClick={exportGraph}
            title="Export as image"
        ><ScreenshotIcon />
        </IconButton>
    )
} 