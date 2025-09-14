/**
 * Navigation Functions
 * Handle page switching between Home and About sections
 */

/**
 * Show Home Page
 * Displays main application interface and hides about page
 */
function showHome() {
    document.querySelector('.container > h2').style.display = 'block';
    document.querySelector('.form-grid').style.display = 'grid';
    document.querySelectorAll('.form-section').forEach(section => section.style.display = 'block');
    document.querySelector('.generate-btn').style.display = 'block';
    document.getElementById('aboutPage').style.display = 'none';
}

/**
 * Show About Page
 * Displays about section and hides main application interface
 */
function showAbout() {
    document.querySelector('.container > h2').style.display = 'none';
    document.querySelector('.form-grid').style.display = 'none';
    document.querySelectorAll('.form-section').forEach(section => section.style.display = 'none');
    document.querySelector('.generate-btn').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('aboutPage').style.display = 'block';
}