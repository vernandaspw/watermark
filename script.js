const downloadBtn = document.getElementById('downloadBtn');

// Fungsi untuk membaca file PDF dari folder public
async function loadPdfFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const pdfBytes = new Uint8Array(await response.arrayBuffer());
    return pdfBytes;
}

// Fungsi untuk menambahkan watermark dan kotak keterangan ke PDF
async function addWatermarkToPdf() {
    try {
        // Ambil nilai input dari halaman HTML
        const watermarkText = document.getElementById('watermarkText').value; // Teks Watermark
        const docTitle = document.getElementById('docTitle').value; // Dokumen Header
        const downloadBy = document.getElementById('downloadBy').value; // Pengunduh

        // Ambil elemen input
        const downloadDateInput = document.getElementById('downloadDate');

        // Fungsi untuk mengubah format menjadi yyyy-mm-dd hh:mm
        function formatDateTime(datetime) {
            // Format input datetime-local menjadi Date object
            const date = new Date(datetime);

            // Ambil bagian tanggal dan waktu dalam format yang diinginkan
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');  // Menambahkan 1 karena bulan mulai dari 0
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            // Kembalikan dalam format "yyyy-mm-dd hh:mm"
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }

        // Ambil nilai dari input datetime-local
        const downloadDate = downloadDateInput.value;

        // Formatkan tanggal dan waktu
        const formattedDownloadDate = formatDateTime(downloadDate);

        

        // Baca PDF dari URL
        const pdfBytes = await loadPdfFromUrl('public/se.pdf');
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
      

        // Tambahkan watermark ke semua halaman
        const pages = pdfDoc.getPages();
        pages.forEach(page => {
            const { width, height } = page.getSize();

            // Menambahkan watermark dari input HTML
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
            
            // Menambahkan kotak keterangan di kiri bawah
            const boxX = 50;
            const boxY = 50;
            const boxWidth = 300;
            const boxHeight = 50;

            // Membuat border merah untuk kotak keterangan
            page.drawRectangle({
                x: boxX,
                y: boxY,
                width: boxWidth,
                height: boxHeight,
                borderColor: PDFLib.rgb(1, 0, 0), // Warna merah
                borderWidth: 2,
            });

            // Menambahkan teks di dalam kotak keterangan
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

        // Simpan PDF yang telah diubah
        const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });

        // Mulai unduh PDF yang telah diberi watermark dan kotak keterangan
        downloadPdf(pdfDataUri, 'watermarked-original.pdf');
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

// Fungsi untuk mengunduh PDF
function downloadPdf(dataUri, filename) {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.click();
}

// Event listener untuk mengunduh PDF dengan watermark dan kotak keterangan saat tombol diklik
downloadBtn.addEventListener('click', addWatermarkToPdf);
