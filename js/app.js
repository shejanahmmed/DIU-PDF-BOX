/**
 * PDF Generator Application
 * Handles file upload, PDF generation, and document preview
 */

// DOM Elements
const fileInput = document.getElementById('fileInput');
const imageList = document.getElementById('imageList');
const submitDateInput = document.getElementById('submitDate');
const hiddenDateInput = document.getElementById('hiddenDate');

// Application State
let filesArray = [];

/**
 * Update Page Numbers
 * Re-indexes all cards to show correct sequence
 */
function updatePageNumbers() {
    const items = imageList.querySelectorAll('.image-item');
    items.forEach((item, index) => {
        const badge = item.querySelector('.page-badge');
        if (badge) {
            badge.textContent = (index + 1).toString().padStart(2, '0');
        }
    });
}

/**
 * Initialize Permanent Cover Card
 */
function renderCoverCard() {
    if (document.getElementById('coverCard')) return;

    const item = document.createElement('div');
    item.className = 'image-item';
    item.id = 'coverCard';
    item.style.cursor = 'default';
    
    // Page Badge
    const badge = document.createElement('div');
    badge.className = 'page-badge';
    badge.textContent = '01';
    item.appendChild(badge);
    
    // Lock/Grip Icon (Disabled style)
    const handle = document.createElement('div');
    handle.className = 'drag-handle';
    handle.style.opacity = '0.3';
    handle.style.cursor = 'not-allowed';
    handle.innerHTML = '<i class="fas fa-lock"></i>';
    item.appendChild(handle);
    
    // Icon (Same as PDF)
    const pdfIcon = document.createElement('div');
    pdfIcon.className = 'pdf-icon';
    pdfIcon.innerHTML = '<i class="fas fa-file-invoice"></i>';
    item.appendChild(pdfIcon);
    
    // File Info
    const info = document.createElement('div');
    info.className = 'file-info';
    info.textContent = 'DIU COVER PAGE (Auto-generated)';
    item.appendChild(info);
    
    // Empty placeholder for remove btn slot to keep alignment
    const spacer = document.createElement('div');
    spacer.style.width = '2rem';
    item.appendChild(spacer);
    
    imageList.prepend(item);
    updatePageNumbers();
}

/**
 * Image Compression Utility
 * Compresses images to reduce file size while maintaining quality
 */
function compressImage(file, quality = 0.7, maxWidth = 1200, maxHeight = 1600) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = img;
            const aspectRatio = width / height;
            
            if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
            }
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with compression
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}



/**
 * File Upload Handler
 * Processes selected files and validates file types
 */
fileInput.addEventListener('change', (e) => {
    // Filter valid file types (images and PDFs)
    const newFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    // Notify user if invalid files were filtered out
    if (newFiles.length !== e.target.files.length) {
        alert('Some files were ignored. Only images and PDF files are supported.');
    }

    // Show Cover Card if this is the first upload
    if (filesArray.length === 0 && newFiles.length > 0) {
        renderCoverCard();
    }
    
    // Append new files to existing array
    const startIndex = filesArray.length;
    filesArray = filesArray.concat(newFiles);
    
    // Create UI elements for each uploaded file
    newFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.dataset.index = startIndex + index;
        
        // Page Badge
        const badge = document.createElement('div');
        badge.className = 'page-badge';
        item.appendChild(badge);

        // Drag Handle
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
        item.appendChild(handle);
        
        // Thumbnail or PDF Icon
        if(file.type.startsWith('image/')){
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            item.appendChild(img);
        } else {
            const pdfIcon = document.createElement('div');
            pdfIcon.className = 'pdf-icon';
            pdfIcon.innerHTML = '<i class="fas fa-file-pdf"></i>';
            item.appendChild(pdfIcon);
        }
        
        // File Info
        const info = document.createElement('div');
        info.className = 'file-info';
        info.textContent = file.name;
        item.appendChild(info);
        
        // Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            const fileIndex = parseInt(item.dataset.index);
            filesArray.splice(fileIndex, 1);
            item.remove();
            
            // Check if we need to remove cover card (if list is empty)
            if (filesArray.length === 0) {
                const cover = document.getElementById('coverCard');
                if (cover) cover.remove();
            }

            Array.from(imageList.children).forEach((child, idx) => {
                child.dataset.index = idx;
            });
            updatePageNumbers();
        };
        item.appendChild(removeBtn);
        
        imageList.appendChild(item);
    });
    
    updatePageNumbers();

    // Initialize drag-and-drop sorting functionality
    if (!imageList.sortable) {
        imageList.sortable = new Sortable(imageList, { 
            animation: 250,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            filter: '#coverCard',
            onMove: function(evt) {
                return evt.related.id !== 'coverCard';
            },
            onEnd: function(evt) {
                // Reorder files array based on new DOM order
                const newOrder = Array.from(imageList.children)
                    .filter(item => item.id !== 'coverCard') // Ignore cover card in array
                    .map(item => parseInt(item.dataset.index));
                
                const reorderedFiles = newOrder.map(index => filesArray[index]);
                filesArray = reorderedFiles;
                
                // Update dataset indices
                Array.from(imageList.children).forEach((item, index) => {
                    item.dataset.index = index;
                });

                updatePageNumbers();
            }
        });
    }
    
    // Clear input to allow re-selection of same files
    fileInput.value = '';
});

/**
 * PDF Generation Handler
 * Creates PDF with cover page and merges uploaded files
 */
document.getElementById('generateBtn').addEventListener('click', async () => {
    const btn = document.getElementById('generateBtn');
    const originalContent = btn.innerHTML;
    
    try {
        // Add loading state
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        btn.style.opacity = '0.8';

        // Initialize PDF-lib components
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();

        // Get document type and create cover page
        const docType = document.getElementById('docType').value;
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const coverPage = pdfDoc.addPage([595, 842]);
        
        // Extract form data
        const semester = document.getElementById('semester').value;
        const studentName = document.getElementById('studentName').value;
        const studentID = document.getElementById('studentID').value;
        const batch = document.getElementById('batch').value;
        const section = document.getElementById('section').value;
        const courseCode = document.getElementById('courseCode').value;
        const courseName = document.getElementById('courseName').value;
        const teacherName = document.getElementById('teacherName').value;
        const designation = document.getElementById('designation').value;
        const submitDate = document.getElementById('submitDate').value;
        
        // Check if document type is supported
        if (docType !== 'assignment.pdf' && docType !== 'lab_report.pdf') {
            alert('Sorry, cover not available now for this document type. Only Assignment and Lab Report covers are currently supported.');
            return;
        }
        
        // Generate DIU cover page based on document type
        if (docType === 'assignment.pdf' || docType === 'lab_report.pdf') {
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            try {
                // Load and Embed DIU Logo Image
                const logoResponse = await fetch('Logos/Logo-DIU.png');
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                
                // Calculate centered position for logo
                const logoWidth = 180;
                const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
                const logoX = (coverPage.getWidth() - logoWidth) / 2;
                const logoY = 750;
                
                coverPage.drawImage(logoImage, {
                    x: logoX,
                    y: logoY,
                    width: logoWidth,
                    height: logoHeight,
                });
            } catch (error) {
                console.error('Error loading DIU logo image:', error);
                // Fallback to text if image fails to load
                coverPage.drawText('Daffodil', { x: 242, y: 800, size: 28, font: boldFont, color: rgb(0.1, 0.4, 0.8) });
                coverPage.drawText('International', { x: 255, y: 785, size: 12, font, color: rgb(0.4, 0.4, 0.4) });
                coverPage.drawText('University', { x: 265, y: 765, size: 24, font: boldFont, color: rgb(0.2, 0.6, 0.2) });
            }
            
            // Document title (centered)
            const isLabReport = docType === 'lab_report.pdf';
            const docTitle = isLabReport ? 'Lab Report' : 'Assignment';
            const docTitleSize = 26;
            const docTitleWidth = boldFont.widthOfTextAtSize(docTitle, docTitleSize);
            const docTitleX = (coverPage.getWidth() - docTitleWidth) / 2;
            coverPage.drawText(docTitle, { x: docTitleX, y: 700, size: docTitleSize, font: boldFont });

            // Initialize evaluation table
            let tableY = 650;
            
            // Draw 'Only for course Teacher' row (Full width header)
            const boxHeight = 30;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: boxHeight, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
            
            const subtitle = 'Only for course Teacher';
            const subtitleSize = 11;
            const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize);
            const subtitleX = 75 + (445 - subtitleWidth) / 2;
            
            // Vertical centering logic: tableY is the baseline, box is centered around it
            const subtitleY = tableY - (subtitleSize / 4);
            coverPage.drawText(subtitle, { x: subtitleX, y: subtitleY, size: subtitleSize, font });

            tableY -= 30; // Move to next row
            
            // Column definitions for precise centering
            const cols = [
                { x: 75, w: 80 }, { x: 155, w: 30 }, { x: 185, w: 80 }, 
                { x: 265, w: 80 }, { x: 345, w: 80 }, { x: 425, w: 50 }, { x: 475, w: 45 }
            ];

            // Helper to draw text centered in a cell (both H and V)
            const drawCenteredInCell = (text, colIndex, y, size, font) => {
                const col = cols[colIndex];
                const tw = font.widthOfTextAtSize(text, size);
                const tx = col.x + (col.w - tw) / 2;
                const ty = y - (size / 4); 
                coverPage.drawText(text, { x: tx, y: ty, size, font });
            };

            // Draw table header borders
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
            cols.slice(0, -1).forEach(c => {
                coverPage.drawLine({ start: { x: c.x + c.w, y: tableY + 15 }, end: { x: c.x + c.w, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
            });

            // Table header text
            drawCenteredInCell('Criteria', 0, tableY, 8, font);
            drawCenteredInCell('Mark', 1, tableY, 8, font);
            drawCenteredInCell('Needs', 2, tableY + 5, 8, font);
            drawCenteredInCell('Improvement', 2, tableY - 5, 8, font);
            drawCenteredInCell('Developing', 3, tableY, 8, font);
            drawCenteredInCell('Sufficient', 4, tableY, 8, font);
            drawCenteredInCell('Above', 5, tableY + 5, 8, font);
            drawCenteredInCell('Average', 5, tableY - 5, 8, font);
            drawCenteredInCell('Total', 6, tableY + 5, 8, font);
            drawCenteredInCell('Mark', 6, tableY - 5, 8, font);
            
            // Percentage allocation row
            tableY -= 30;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
            cols.slice(0, -1).forEach(c => {
                coverPage.drawLine({ start: { x: c.x + c.w, y: tableY + 15 }, end: { x: c.x + c.w, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
            });

            if (isLabReport) {
                drawCenteredInCell('Allocate mark &', 0, tableY + 5, 8, font);
                drawCenteredInCell('Percentage', 0, tableY - 5, 8, font);
                drawCenteredInCell('25%', 2, tableY, 8, font);
                drawCenteredInCell('50%', 3, tableY, 8, font);
                drawCenteredInCell('75%', 4, tableY, 8, font);
                drawCenteredInCell('100%', 5, tableY, 8, font);
                drawCenteredInCell('25', 6, tableY, 8, font);
            } else {
                drawCenteredInCell('Allocate mark &', 0, tableY + 5, 8, font);
                drawCenteredInCell('Percentage', 0, tableY - 5, 8, font);
                drawCenteredInCell('25%', 2, tableY, 8, font);
                drawCenteredInCell('50%', 3, tableY, 8, font);
                drawCenteredInCell('75%', 4, tableY, 8, font);
                drawCenteredInCell('100%', 5, tableY, 8, font);
                drawCenteredInCell('5', 6, tableY, 8, font);
            }
            
            // Define evaluation criteria based on document type
            const criteriaList = isLabReport ? [
                { name: 'Understanding', mark: '3' },
                { name: 'Analysis', mark: '4' },
                { name: 'Implementation', mark: '8' },
                { name: 'Report Writing', mark: '10' }
            ] : [
                { name: 'Clarity', mark: '1' },
                { name: 'Content Quality', mark: '2' },
                { name: 'Spelling & Grammar', mark: '1' },
                { name: 'Organization', mark: '1' }
            ];
            
            // Draw criteria rows
            criteriaList.forEach(item => {
                tableY -= 30;
                coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
                cols.slice(0, -1).forEach(c => {
                    coverPage.drawLine({ start: { x: c.x + c.w, y: tableY + 15 }, end: { x: c.x + c.w, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                });
                
                drawCenteredInCell(item.name, 0, tableY, 8, font);
                drawCenteredInCell(item.mark, 1, tableY, 8, font);
            });
            
            // Total marks row
            tableY -= 30;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
            coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
            
            // Left-align 'Total obtained mark' with padding
            coverPage.drawText('Total obtained mark', { x: 85, y: tableY - (8 / 4), size: 8, font });
            
            // Comments section
            tableY -= 60;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 60, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
            coverPage.drawText('Comments', { x: 90, y: tableY + 30, size: 8, font });
            
            // Add student and course information with more whitespace from table
            let infoY = 320;
            coverPage.drawText(`Semester: ${semester || 'Unknown'}`, { x: 75, y: infoY, size: 11, font });
            infoY -= 25;
            coverPage.drawText(`Student Name: ${studentName || 'Unknown'}`, { x: 75, y: infoY, size: 11, font });
            infoY -= 25;
            coverPage.drawText(`Student ID: ${studentID || '123456789'}`, { x: 75, y: infoY, size: 11, font });
            infoY -= 25;
            coverPage.drawText(`Batch: ${batch || 'Unknown'}`, { x: 75, y: infoY, size: 11, font });
            coverPage.drawText(`Section: ${section || 'Unknown'}`, { x: 300, y: infoY, size: 11, font });
            infoY -= 25;
            coverPage.drawText(`Course Code: ${courseCode || 'Unknown'}`, { x: 75, y: infoY, size: 11, font });
            coverPage.drawText(`Course Name: ${courseName || 'Unknown'}`, { x: 300, y: infoY, size: 11, font });
            infoY -= 25;
            coverPage.drawText(`Course Teacher Name: ${teacherName || 'Unknown'}`, { x: 75, y: infoY, size: 11, font });
            infoY -= 25;
            coverPage.drawText(`Designation: ${designation || 'Unknown'}`, { x: 75, y: infoY, size: 11, font });
            infoY -= 25;
            
            // Format and add submission date
            let formattedDate;
            if (submitDate && submitDate.trim() !== '') {
                formattedDate = submitDate;
            } else {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = String(today.getFullYear()).slice(-2);
                formattedDate = `${day}/${month}/${year}`;
            }
            coverPage.drawText(`Submission Date: ${formattedDate}`, { x: 75, y: infoY, size: 11, font });
        }

        // Process and add uploaded files to PDF
        for(const file of filesArray){
            if(file.type.startsWith('image/')){
                try {
                    const compressedBlob = await compressImage(file, 0.8, 1200, 1600);
                    const imgBytes = await compressedBlob.arrayBuffer();
                    const img = await pdfDoc.embedJpg(imgBytes);
                    
                    const maxWidth = 545;
                    const maxHeight = 792;
                    let { width, height } = img;
                    const aspectRatio = width / height;
                    
                    if (width > maxWidth) {
                        width = maxWidth;
                        height = width / aspectRatio;
                    }
                    if (height > maxHeight) {
                        height = maxHeight;
                        width = height * aspectRatio;
                    }
                    
                    const imgPage = pdfDoc.addPage([595, 842]);
                    const x = (595 - width) / 2;
                    const y = (842 - height) / 2;
                    imgPage.drawImage(img, { x, y, width, height });
                } catch (error) {
                    console.error(`Error processing image ${file.name}:`, error);
                }
            } else if(file.type === 'application/pdf'){
                try {
                    const pdfBytes = await file.arrayBuffer();
                    const uploadPdf = await PDFDocument.load(pdfBytes);
                    const pageCount = uploadPdf.getPageCount();
                    
                    for (let i = 0; i < pageCount; i++) {
                        const [copiedPage] = await pdfDoc.copyPages(uploadPdf, [i]);
                        pdfDoc.addPage(copiedPage);
                    }
                } catch (error) {
                    console.error(`Error processing PDF ${file.name}:`, error);
                }
            }
        }

        // Generate final PDF and create preview
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const fileSizeBytes = pdfBytes.length;
        const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
        const fileSizeKB = (fileSizeBytes / 1024).toFixed(0);
        const sizeDisplay = fileSizeBytes > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;
        
        document.getElementById('fileSizeInfo').textContent = `File size: ${sizeDisplay}`;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        document.getElementById('previewSection').style.display = 'block';
        
        if (isMobile) {
            document.getElementById('preview').style.display = 'none';
            document.getElementById('mobilePreview').style.display = 'block';
            document.getElementById('openPdfBtn').onclick = () => {
                window.open(blobUrl, '_blank');
            };
        } else {
            document.getElementById('preview').style.display = 'block';
            document.getElementById('mobilePreview').style.display = 'none';
            document.getElementById('preview').src = blobUrl;
        }
        
        document.getElementById('downloadName').value = document.getElementById('outputName').value || 'DIU.pdf';
        window.currentPdfBlob = blobUrl;
        
        btn.disabled = false;
        btn.innerHTML = originalContent;
        btn.style.opacity = '1';
        
        document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = originalContent;
        btn.style.opacity = '1';
    }
});

/**
 * Download Handler
 */
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (window.currentPdfBlob) {
        const a = document.createElement('a');
        a.href = window.currentPdfBlob;
        a.download = document.getElementById('downloadName').value || 'DIU.pdf';
        a.click();
    }
});

/**
 * BLC Button Handler
 */
document.getElementById('blcBtn').addEventListener('click', () => {
    window.open('https://elearn.daffodilvarsity.edu.bd/', '_blank');
});