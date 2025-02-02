import html2canvas from "html2canvas";

const exportAsImage = async (el: HTMLElement, imageFileName: string) => {
    const canvas = await html2canvas(el)
    const imageBlob = canvas.toDataURL("image/png")
    downloadImage(imageBlob, imageFileName)
}

const downloadImage = (blob: string, imageFileName: string) => {
    const fakeLink = document.createElement('a')
    fakeLink.style.display = 'none'
    fakeLink.download = imageFileName
    fakeLink.href = blob

    document.body.appendChild(fakeLink)
    fakeLink.click()
    document.body.removeChild(fakeLink)
    fakeLink.remove()
}

export default exportAsImage