/**
 * Navigation Functions
 * Handle page switching and theme management
 */

/**
 * Update active navigation link
 */
function updateActiveNav(activeId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    // Add active class to current link
    document.getElementById(activeId).classList.add('active');
}

/**
 * Show Home Page
 * Displays main application interface and hides other pages
 */
function showHome() {
    document.querySelector('.hero-section').style.display = 'block';
    document.querySelector('.form-grid').style.display = 'grid';
    document.querySelectorAll('.form-section').forEach(section => section.style.display = 'block');
    document.querySelector('.generate-btn').style.display = 'block';
    document.getElementById('aboutPage').style.display = 'none';
    document.getElementById('howItWorksPage').style.display = 'none';
    updateActiveNav('home-link');
}

/**
 * Show About Page
 * Displays about section and hides main application interface
 */
function showAbout() {
    document.querySelector('.hero-section').style.display = 'none';
    document.querySelector('.form-grid').style.display = 'none';
    document.querySelectorAll('.form-section').forEach(section => section.style.display = 'none');
    document.querySelector('.generate-btn').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('aboutPage').style.display = 'block';
    document.getElementById('howItWorksPage').style.display = 'none';
    updateActiveNav('about-link');
}

/**
 * Show How It Works Page
 * Displays how it works section and hides main application interface
 */
function showHowItWorks() {
    document.querySelector('.hero-section').style.display = 'none';
    document.querySelector('.form-grid').style.display = 'none';
    document.querySelectorAll('.form-section').forEach(section => section.style.display = 'none');
    document.querySelector('.generate-btn').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('aboutPage').style.display = 'none';
    document.getElementById('howItWorksPage').style.display = 'block';
    updateActiveNav('how-link');
}

/**
 * Theme Management
 */
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (body.classList.contains('dark-theme')) {
        // Switch to light theme
        body.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        // Switch to dark theme
        body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * Initialize theme on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-moon';
    } else {
        // Default to dark theme
        document.body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
    }
});