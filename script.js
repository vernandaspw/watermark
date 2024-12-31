const downloadBtn = document.getElementById('downloadBtn');

async function loadPdfFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const pdfBytes = new Uint8Array(await response.arrayBuffer());
    return pdfBytes;
}

async function addWatermarkToPdf() {
    try {
        const watermarkText = document.getElementById('watermarkText').value; 
        const docTitle = document.getElementById('docTitle').value; 
        const downloadBy = document.getElementById('downloadBy').value; 

        const downloadDateInput = document.getElementById('downloadDate');

        function formatDateTime(datetime) {
            const date = new Date(datetime);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');  // Menambahkan 1 karena bulan mulai dari 0
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }

        const downloadDate = downloadDateInput.value;
        const formattedDownloadDate = formatDateTime(downloadDate);

        const pdfBytes = await loadPdfFromUrl('public/se.pdf');
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
      
        const pages = pdfDoc.getPages();
        pages.forEach(page => {
            const { width, height } = page.getSize();
            page.drawText(watermarkText, {
                x: width / 2 - 100,
                y: height / 2,
                size: 50,
                color: PDFLib.rgb(1, 0, 0),
                opacity: 0.5,
                rotate: PDFLib.degrees(45),
            });
            function getTextWidth(text, size) {
                return page.widthOfTextAtSize(text, size);
            }
            
            const boxX = 50;
            const boxY = 50;
            const boxWidth = 300;
            const boxHeight = 50;

            page.drawRectangle({
                x: boxX,
                y: boxY,
                width: boxWidth,
                height: boxHeight,
                borderColor: PDFLib.rgb(1, 0, 0), // Warna merah
                borderWidth: 2,
            });

            page.drawText(docTitle, {
                x: boxX + 10,
                y: boxY + 30,
                size: 9,
                color:PDFLib.rgb(1, 0, 0),
            });

            page.drawText(`diunduh oleh: ${downloadBy}`, {
                x: boxX + 10,
                y: boxY + 20,
                size: 9,
                color:PDFLib.rgb(1, 0, 0),
            });

            page.drawText(`diunduh pada: ${formattedDownloadDate}`, {
                x: boxX + 10,
                y: boxY + 10,
                size: 9,
                color:PDFLib.rgb(1, 0, 0),
            });
        });

        const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });

        downloadPdf(pdfDataUri, 'watermarked-original.pdf');
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

function downloadPdf(dataUri, filename) {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.click();
}

downloadBtn.addEventListener('click', addWatermarkToPdf);
