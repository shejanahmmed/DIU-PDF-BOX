/**
 * PDF Generator Application
 * Handles file upload, PDF generation, and document preview
 */

// DOM Elements
const fileInput = document.getElementById('fileInput');
const imageList = document.getElementById('imageList');
const submitDateInput = document.getElementById('submitDate');
const hiddenDateInput = document.getElementById('hiddenDate');
const teacherInput = document.getElementById('teacherName');
const designationInput = document.getElementById('designation');
const autocompleteList = document.getElementById('teacherAutocomplete');

// Application State
let filesArray = [];

/**
 * Autocomplete Handler
 * Uses facultyData from js/faculty_data.js
 */
if (teacherInput && autocompleteList) {
    teacherInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        autocompleteList.innerHTML = '';
        
        if (!value || typeof facultyData === 'undefined') {
            autocompleteList.style.display = 'none';
            const parent = teacherInput.closest('.form-section');
            if (parent) parent.style.zIndex = '1';
            return;
        }

        const filtered = facultyData.filter(f => 
            f.name.toLowerCase().includes(value)
        ).slice(0, 10);

        if (filtered.length > 0) {
            // Revert to professional absolute positioning
            autocompleteList.style.display = 'block';
            
            // Boost parent container z-index while active to stay on top of other boxes
            const parent = teacherInput.closest('.form-section');
            if (parent) parent.style.zIndex = '1000';

            filtered.forEach(faculty => {
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.innerHTML = `<strong>${faculty.name}</strong><span>${faculty.designation}</span>`;
                div.onclick = () => {
                    teacherInput.value = faculty.name;
                    designationInput.value = faculty.designation;
                    autocompleteList.style.display = 'none';
                    if (parent) parent.style.zIndex = '1';
                };
                autocompleteList.appendChild(div);
            });
        } else {
            autocompleteList.style.display = 'none';
        }
    });

    // Close list when clicking outside
    document.addEventListener('click', (e) => {
        if (!teacherInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.style.display = 'none';
        }
    });
}

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
 */
function compressImage(file, quality = 0.7, maxWidth = 1200, maxHeight = 1600) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
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
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

/**
 * File Upload Handler
 */
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const newFiles = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/') || file.type === 'application/pdf'
        );
        
        if (newFiles.length !== e.target.files.length) {
            alert('Some files were ignored. Only images and PDF files are supported.');
        }

        if (filesArray.length === 0 && newFiles.length > 0) {
            renderCoverCard();
        }
        
        const startIndex = filesArray.length;
        filesArray = filesArray.concat(newFiles);
        
        newFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'image-item';
            item.dataset.index = startIndex + index;
            
            const pBadge = document.createElement('div');
            pBadge.className = 'page-badge';
            item.appendChild(pBadge);

            const handle = document.createElement('div');
            handle.className = 'drag-handle';
            handle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
            item.appendChild(handle);
            
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
            
            const info = document.createElement('div');
            info.className = 'file-info';
            info.textContent = file.name;
            item.appendChild(info);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                const fileIndex = parseInt(item.dataset.index);
                filesArray.splice(fileIndex, 1);
                item.remove();
                
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
                    const newOrder = Array.from(imageList.children)
                        .filter(item => item.id !== 'coverCard')
                        .map(item => parseInt(item.dataset.index));
                    
                    const reorderedFiles = newOrder.map(index => filesArray[index]);
                    filesArray = reorderedFiles;
                    
                    Array.from(imageList.children).forEach((item, index) => {
                        item.dataset.index = index;
                    });

                    updatePageNumbers();
                }
            });
        }
        
        fileInput.value = '';
    });
}

/**
 * PDF Generation Handler
 */
document.getElementById('generateBtn').addEventListener('click', async () => {
    const btn = document.getElementById('generateBtn');
    const originalContent = btn.innerHTML;
    
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        btn.style.opacity = '0.8';

        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();

        const docType = document.getElementById('docType').value;
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const coverPage = pdfDoc.addPage([595, 842]);
        
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
        
        if (docType !== 'assignment.pdf' && docType !== 'lab_report.pdf') {
            alert('Sorry, cover not available now for this document type. Only Assignment and Lab Report covers are currently supported.');
            btn.disabled = false;
            btn.innerHTML = originalContent;
            return;
        }
        
        if (docType === 'assignment.pdf' || docType === 'lab_report.pdf') {
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            try {
                const logoResponse = await fetch('Logos/Logo-DIU.png');
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                
                const logoWidth = 180;
                const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
                const logoX = (coverPage.getWidth() - logoWidth) / 2;
                const logoY = 750;
                
                coverPage.drawImage(logoImage, { x: logoX, y: logoY, width: logoWidth, height: logoHeight });
            } catch (error) {
                console.error('Error loading DIU logo image:', error);
                coverPage.drawText('Daffodil', { x: 242, y: 800, size: 28, font: boldFont, color: rgb(0.1, 0.4, 0.8) });
                coverPage.drawText('International', { x: 255, y: 785, size: 12, font, color: rgb(0.4, 0.4, 0.4) });
                coverPage.drawText('University', { x: 265, y: 765, size: 24, font: boldFont, color: rgb(0.2, 0.6, 0.2) });
            }
            
            const isLabReport = docType === 'lab_report.pdf';
            const docTitle = isLabReport ? 'Lab Report' : 'Assignment';
            const docTitleSize = 26;
            const docTitleWidth = boldFont.widthOfTextAtSize(docTitle, docTitleSize);
            coverPage.drawText(docTitle, { x: (coverPage.getWidth() - docTitleWidth) / 2, y: 700, size: docTitleSize, font: boldFont });

            let tableY = 650;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, borderColor: rgb(0, 0, 0), opacity: 0 });
            const subtitle = 'Only for course Teacher';
            const subtitleWidth = font.widthOfTextAtSize(subtitle, 11);
            coverPage.drawText(subtitle, { x: 75 + (445 - subtitleWidth) / 2, y: tableY - (11 / 4), size: 11, font });

            tableY -= 30;
            
            const cols = [{ x: 75, w: 80 }, { x: 155, w: 30 }, { x: 185, w: 80 }, { x: 265, w: 80 }, { x: 345, w: 80 }, { x: 425, w: 50 }, { x: 475, w: 45 }];
            const drawCenteredInCell = (text, colIndex, y, size, font) => {
                const col = cols[colIndex];
                const tw = font.widthOfTextAtSize(text, size);
                coverPage.drawText(text, { x: col.x + (col.w - tw) / 2, y: y - (size / 4), size, font });
            };

            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, borderColor: rgb(0, 0, 0), opacity: 0 });
            cols.slice(0, -1).forEach(c => coverPage.drawLine({ start: { x: c.x + c.w, y: tableY + 15 }, end: { x: c.x + c.w, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) }));

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
            
            tableY -= 30;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, borderColor: rgb(0, 0, 0), opacity: 0 });
            cols.slice(0, -1).forEach(c => coverPage.drawLine({ start: { x: c.x + c.w, y: tableY + 15 }, end: { x: c.x + c.w, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) }));

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
            
            const criteriaList = isLabReport ? [{ name: 'Understanding', mark: '3' }, { name: 'Analysis', mark: '4' }, { name: 'Implementation', mark: '8' }, { name: 'Report Writing', mark: '10' }] : [{ name: 'Clarity', mark: '1' }, { name: 'Content Quality', mark: '2' }, { name: 'Spelling & Grammar', mark: '1' }, { name: 'Organization', mark: '1' }];
            
            criteriaList.forEach(item => {
                tableY -= 30;
                coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, borderColor: rgb(0, 0, 0), opacity: 0 });
                cols.slice(0, -1).forEach(c => coverPage.drawLine({ start: { x: c.x + c.w, y: tableY + 15 }, end: { x: c.x + c.w, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) }));
                drawCenteredInCell(item.name, 0, tableY, 8, font);
                drawCenteredInCell(item.mark, 1, tableY, 8, font);
            });
            
            tableY -= 30;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, borderColor: rgb(0, 0, 0), opacity: 0 });
            coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
            coverPage.drawText('Total obtained mark', { x: 85, y: tableY - 2, size: 8, font });
            
            tableY -= 60;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 60, borderWidth: 1, borderColor: rgb(0, 0, 0), opacity: 0 });
            coverPage.drawText('Comments', { x: 90, y: tableY + 30, size: 8, font });
            
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
            
            let formattedDate = submitDate || new Date().toLocaleDateString('en-GB');
            coverPage.drawText(`Submission Date: ${formattedDate}`, { x: 75, y: infoY, size: 11, font });
        }

        for(const file of filesArray){
            if(file.type.startsWith('image/')){
                try {
                    const compressedBlob = await compressImage(file, 0.8, 1200, 1600);
                    const imgBytes = await compressedBlob.arrayBuffer();
                    const img = await pdfDoc.embedJpg(imgBytes);
                    const maxWidth = 545, maxHeight = 792;
                    let { width, height } = img;
                    const aspectRatio = width / height;
                    if (width > maxWidth) { width = maxWidth; height = width / aspectRatio; }
                    if (height > maxHeight) { height = maxHeight; width = height * aspectRatio; }
                    const imgPage = pdfDoc.addPage([595, 842]);
                    imgPage.drawImage(img, { x: (595 - width) / 2, y: (842 - height) / 2, width, height });
                } catch (e) { console.error(e); }
            } else if(file.type === 'application/pdf'){
                try {
                    const pdfBytes = await file.arrayBuffer();
                    const uploadPdf = await PDFDocument.load(pdfBytes);
                    const [copiedPage] = await pdfDoc.copyPages(uploadPdf, [0]);
                    pdfDoc.addPage(copiedPage);
                } catch (e) { console.error(e); }
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const sizeDisplay = pdfBytes.length > 1024 * 1024 ? `${(pdfBytes.length / (1024 * 1024)).toFixed(2)} MB` : `${(pdfBytes.length / 1024).toFixed(0)} KB`;
        document.getElementById('fileSizeInfo').textContent = `File size: ${sizeDisplay}`;

        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768;
        document.getElementById('previewSection').style.display = 'block';
        if (isMobile) {
            document.getElementById('preview').style.display = 'none';
            document.getElementById('mobilePreview').style.display = 'block';
            document.getElementById('openPdfBtn').onclick = () => window.open(blobUrl, '_blank');
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
        console.error(error);
        alert('Error: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = originalContent;
        btn.style.opacity = '1';
    }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    if (window.currentPdfBlob) {
        const a = document.createElement('a');
        a.href = window.currentPdfBlob;
        a.download = document.getElementById('downloadName').value || 'DIU.pdf';
        a.click();
    }
});

document.getElementById('blcBtn').addEventListener('click', () => window.open('https://elearn.daffodilvarsity.edu.bd/', '_blank'));
