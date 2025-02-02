import { createRef } from 'react';
import exportAsImage from '../utils/screen';

function useScreenshotHandler() {
    const exportButtonRef = createRef<HTMLButtonElement>()
    const graphRef = createRef<HTMLDivElement>()

    const exportGraph = async () => {
        if (graphRef.current && exportButtonRef.current) {
            exportButtonRef.current.style.display = "none"
            await exportAsImage(graphRef.current, 'graph.png')

            setTimeout(() => {
                if (exportButtonRef.current) {
                    exportButtonRef.current.style.display = "inline-block"
                }
            }, 1000)
        }
    }

    return { exportGraph, exportButtonRef, graphRef }
}

export default useScreenshotHandler;