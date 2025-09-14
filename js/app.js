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
 * Date Picker Handler
 * Formats date from YYYY-MM-DD to DD/MM/YY
 */
hiddenDateInput.addEventListener('change', function() {
    const selectedDate = new Date(this.value + 'T00:00:00');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = String(selectedDate.getFullYear()).slice(-2);
    submitDateInput.value = `${day}/${month}/${year}`;
});

// Click handler for the visible date input
submitDateInput.addEventListener('click', function() {
    hiddenDateInput.showPicker();
});

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
    
    // Append new files to existing array
    const startIndex = filesArray.length;
    filesArray = filesArray.concat(newFiles);
    
    // Create UI elements for each uploaded file
    newFiles.forEach((file, index) => {
        // Create file item container
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:10px;padding:12px;border:1px solid rgba(255,255,255,0.15);margin:8px 0;cursor:grab;background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border-radius:8px;color:#fff';
        item.dataset.index = startIndex + index;
        
        // Add file preview (image thumbnail or PDF icon)
        if(file.type.startsWith('image/')){
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.cssText = 'width:50px;height:50px;object-fit:cover';
            item.appendChild(img);
        } else {
            const icon = document.createElement('div');
            icon.textContent = '📄';
            icon.style.cssText = 'width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-size:24px;background:rgba(255,255,255,0.1);border-radius:6px';
            item.appendChild(icon);
        }
        
        // Add file name
        const name = document.createElement('span');
        name.textContent = file.name;
        item.appendChild(name);
        
        // Add remove button with hover effects
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.style.cssText = 'background:rgba(255,107,107,0.8);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;margin-left:auto;font-size:14px;font-weight:bold;transition:all 0.3s ease';
        removeBtn.onmouseenter = () => removeBtn.style.background = 'rgba(255,107,107,1)';
        removeBtn.onmouseleave = () => removeBtn.style.background = 'rgba(255,107,107,0.8)';
        removeBtn.onclick = () => {
            const fileIndex = parseInt(item.dataset.index);
            filesArray.splice(fileIndex, 1);
            item.remove();
            // Update indices after removal
            Array.from(imageList.children).forEach((child, idx) => {
                child.dataset.index = idx;
            });
        };
        item.appendChild(removeBtn);
        
        imageList.appendChild(item);
    });
    
    // Initialize drag-and-drop sorting functionality
    if (!imageList.sortable) {
        imageList.sortable = new Sortable(imageList, { 
            animation: 150,
            onEnd: function(evt) {
                // Reorder files array based on new DOM order
                const newOrder = Array.from(imageList.children).map(item => parseInt(item.dataset.index));
                const reorderedFiles = newOrder.map(index => filesArray[index]);
                filesArray = reorderedFiles;
                
                // Update dataset indices
                Array.from(imageList.children).forEach((item, index) => {
                    item.dataset.index = index;
                });
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
    try {
        // Initialize PDF-lib components
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();

        // Get document type and attempt template loading
        const docType = document.getElementById('docType').value;
        
        let coverPage;
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let templateLoaded = false;
        
        // Try to load predefined template
        try {
            const response = await fetch(`templates/${docType}`);
            if (response.ok) {
                const templateBytes = await response.arrayBuffer();
                const templatePdf = await PDFDocument.load(templateBytes);
                const [templatePage] = await pdfDoc.copyPages(templatePdf, [0]);
                coverPage = pdfDoc.addPage(templatePage);
                templateLoaded = true;
                console.log(`Using ${docType} template`);
            }
        } catch (error) {
            console.log(`Could not load ${docType}:`, error.message);
        }
        
        // Fallback to blank page if template not found
        if (!templateLoaded) {
            coverPage = pdfDoc.addPage([595, 842]);
            console.log('Using default blank page');
        }
        
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
        if (!templateLoaded || docType === 'assignment.pdf' || docType === 'lab_report.pdf') {
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            // Draw DIU logo text (centered)
            coverPage.drawText('Daffodil', { x: 242, y: 800, size: 28, font: boldFont, color: rgb(0.1, 0.4, 0.8) });
            coverPage.drawText('International', { x: 255, y: 785, size: 12, font, color: rgb(0.4, 0.4, 0.4) });
            coverPage.drawText('University', { x: 265, y: 765, size: 24, font: boldFont, color: rgb(0.2, 0.6, 0.2) });
            
            // Document title and header based on type (centered)
            const isLabReport = docType === 'lab_report.pdf';
            const docTitle = isLabReport ? 'Lab Report' : 'Assignment';
            coverPage.drawText(docTitle, { x: isLabReport ? 255 : 245, y: 700, size: 20, font });
            coverPage.drawText('Only for course Teacher', { x: isLabReport ? 245 : 235, y: 655, size: 11, font });
            
            // Initialize evaluation table
            let tableY = 630;
            
            // Draw table header with borders - different layout for lab report vs assignment
            if (isLabReport) {
                // Lab report table with criteria number column
                coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
                coverPage.drawLine({ start: { x: 155, y: tableY + 15 }, end: { x: 155, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 185, y: tableY + 15 }, end: { x: 185, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 265, y: tableY + 15 }, end: { x: 265, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 345, y: tableY + 15 }, end: { x: 345, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 425, y: tableY + 15 }, end: { x: 425, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
            } else {
                // Assignment table with marks column
                coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
                coverPage.drawLine({ start: { x: 155, y: tableY + 15 }, end: { x: 155, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 185, y: tableY + 15 }, end: { x: 185, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 265, y: tableY + 15 }, end: { x: 265, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 345, y: tableY + 15 }, end: { x: 345, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 425, y: tableY + 15 }, end: { x: 425, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
            }
            
            // Table header text - different for lab report vs assignment
            if (isLabReport) {

                coverPage.drawText('Needs', { x: 205, y: tableY + 5, size: 8, font });
                coverPage.drawText('Improvement', { x: 200, y: tableY - 5, size: 8, font });
                coverPage.drawText('Developing', { x: 285, y: tableY, size: 8, font });
                coverPage.drawText('Sufficient', { x: 365, y: tableY, size: 8, font });
                coverPage.drawText('Above', { x: 435, y: tableY + 5, size: 8, font });
                coverPage.drawText('Average', { x: 433, y: tableY - 5, size: 8, font });
                coverPage.drawText('Total', { x: 485, y: tableY + 5, size: 8, font });
                coverPage.drawText('Mark', { x: 485, y: tableY - 5, size: 8, font });
            } else {
                coverPage.drawText('Needs', { x: 205, y: tableY + 5, size: 8, font });
                coverPage.drawText('Improvement', { x: 200, y: tableY - 5, size: 8, font });
                coverPage.drawText('Developing', { x: 285, y: tableY, size: 8, font });
                coverPage.drawText('Sufficient', { x: 365, y: tableY, size: 8, font });
                coverPage.drawText('Above', { x: 435, y: tableY + 5, size: 8, font });
                coverPage.drawText('Average', { x: 433, y: tableY - 5, size: 8, font });
                coverPage.drawText('Total', { x: 485, y: tableY + 5, size: 8, font });
                coverPage.drawText('Mark', { x: 485, y: tableY - 5, size: 8, font });
            }
            
            // Percentage allocation row
            tableY -= 30;
            if (isLabReport) {
                coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
                coverPage.drawLine({ start: { x: 155, y: tableY + 15 }, end: { x: 155, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 185, y: tableY + 15 }, end: { x: 185, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 265, y: tableY + 15 }, end: { x: 265, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 345, y: tableY + 15 }, end: { x: 345, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 425, y: tableY + 15 }, end: { x: 425, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                
                coverPage.drawText('Allocate mark &', { x: 80, y: tableY + 5, size: 8, font });
                coverPage.drawText('Percentage', { x: 90, y: tableY - 5, size: 8, font });
                coverPage.drawText('25%', { x: 215, y: tableY, size: 8, font });
                coverPage.drawText('50%', { x: 295, y: tableY, size: 8, font });
                coverPage.drawText('75%', { x: 375, y: tableY, size: 8, font });
                coverPage.drawText('100%', { x: 440, y: tableY, size: 8, font });
                coverPage.drawText('25', { x: 495, y: tableY, size: 8, font });
            } else {
                coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
                coverPage.drawLine({ start: { x: 155, y: tableY + 15 }, end: { x: 155, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 185, y: tableY + 15 }, end: { x: 185, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 265, y: tableY + 15 }, end: { x: 265, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 345, y: tableY + 15 }, end: { x: 345, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 425, y: tableY + 15 }, end: { x: 425, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                
                coverPage.drawText('Allocate mark &', { x: 80, y: tableY + 5, size: 8, font });
                coverPage.drawText('Percentage', { x: 90, y: tableY - 5, size: 8, font });
                coverPage.drawText('25%', { x: 215, y: tableY, size: 8, font });
                coverPage.drawText('50%', { x: 295, y: tableY, size: 8, font });
                coverPage.drawText('75%', { x: 375, y: tableY, size: 8, font });
                coverPage.drawText('100%', { x: 440, y: tableY, size: 8, font });
                coverPage.drawText('5', { x: 495, y: tableY, size: 8, font });
            }
            
            // Define evaluation criteria based on document type
            const criteria = isLabReport ? [
                { name: 'Understanding', mark: '3' },
                { name: 'Analysis', mark: '4' },
                { name: 'Implementation', mark: '8' },
                { name: 'Report Writing', mark: '10' }
            ] : [
                { name: 'Clarity', mark: '1' },
                { name: 'Content Quality', mark: '2' },
                { name: 'Spelling &\\nGrammar', mark: '1' },
                { name: 'Organization &\\nFormatting', mark: '1' }
            ];
            
            // Draw criteria rows
            criteria.forEach(item => {
                tableY -= 30;
                // Draw row borders
                coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
                coverPage.drawLine({ start: { x: 155, y: tableY + 15 }, end: { x: 155, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 185, y: tableY + 15 }, end: { x: 185, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 265, y: tableY + 15 }, end: { x: 265, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 345, y: tableY + 15 }, end: { x: 345, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 425, y: tableY + 15 }, end: { x: 425, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
                
                // Handle multi-line text for assignment
                if (!isLabReport && item.name.includes('\\n')) {
                    const lines = item.name.split('\\n');
                    coverPage.drawText(lines[0], { x: 80, y: tableY + 3, size: 8, font });
                    coverPage.drawText(lines[1], { x: 80, y: tableY - 7, size: 8, font });
                } else {
                    coverPage.drawText(item.name, { x: 80, y: tableY, size: 8, font });
                }
                coverPage.drawText(item.mark, { x: isLabReport ? 165 : 168, y: tableY, size: 8, font });
            });
            
            // Total marks row
            tableY -= 30;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 30, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
            coverPage.drawLine({ start: { x: 475, y: tableY + 15 }, end: { x: 475, y: tableY - 15 }, thickness: 1, color: rgb(0, 0, 0) });
            coverPage.drawText('Total obtained mark', { x: 90, y: tableY - 2, size: 8, font });
            
            // Comments section
            tableY -= 60;
            coverPage.drawRectangle({ x: 75, y: tableY - 15, width: 445, height: 60, borderWidth: 1, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), opacity: 0 });
            coverPage.drawText('Comments', { x: 90, y: tableY + 30, size: 8, font });
            
            // Add student and course information
            let infoY = 350;
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
                // Use the already formatted date from the input field
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
                    const imgBytes = await file.arrayBuffer();
                    let img;
                    // Try different image formats
                    try {
                        img = await pdfDoc.embedJpg(imgBytes);
                    } catch {
                        try {
                            img = await pdfDoc.embedPng(imgBytes);
                        } catch {
                            console.error(`Failed to embed image: ${file.name}`);
                            continue;
                        }
                    }
                    
                    // Scale image to fit A4 page while maintaining aspect ratio
                    const maxWidth = 545;  // A4 width minus margins
                    const maxHeight = 792; // A4 height minus margins
                    
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
                    
                    // Center image on new page
                    const imgPage = pdfDoc.addPage([595, 842]);
                    const x = (595 - width) / 2;
                    const y = (842 - height) / 2;
                    imgPage.drawImage(img, { x, y, width, height });
                } catch (error) {
                    console.error(`Error processing image ${file.name}:`, error);
                }
            } else if(file.type === 'application/pdf'){
                try {
                    // Load and merge PDF pages
                    const pdfBytes = await file.arrayBuffer();
                    const uploadPdf = await PDFDocument.load(pdfBytes);
                    const pageCount = uploadPdf.getPageCount();
                    console.log(`Processing PDF: ${file.name} with ${pageCount} pages`);
                    
                    // Copy all pages from uploaded PDF
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

        // Show preview section with generated PDF
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('preview').src = blobUrl;
        document.getElementById('downloadName').value = document.getElementById('outputName').value || 'DIU.pdf';

        // Store blob URL for download
        window.currentPdfBlob = blobUrl;
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
});

/**
 * Download Handler
 * Triggers PDF download with user-specified filename
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
 * Opens BLC website in new tab
 */
document.getElementById('blcBtn').addEventListener('click', () => {
    window.open('https://elearn.daffodilvarsity.edu.bd/', '_blank');
});