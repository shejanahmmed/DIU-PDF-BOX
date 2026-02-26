/**
 * Navigation Functions
 * Handle page-specific logic and theme management
 */

/**
 * Update active navigation link
 */
function updateActiveNav() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    
    // Remove active class from all
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });

    let activeId = 'home-link';
    if (page === 'about.html') activeId = 'about-link';
    if (page === 'how-it-works.html') activeId = 'how-link';

    const desktopLink = document.getElementById(activeId);
    const mobileLink = document.getElementById('mobile-' + activeId);
    
    if (desktopLink) desktopLink.classList.add('active');
    if (mobileLink) mobileLink.classList.add('active');
}

/**
 * Scroll Reveal Implementation
 */
function handleReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

/**
 * Theme Management
 */
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * Mobile Menu Functions
 */
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const hamburger = document.querySelector('.hamburger-menu');
    if (!mobileNav || !hamburger) return;

    mobileNav.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (mobileNav.classList.contains('active')) {
        if (icon) icon.className = 'fas fa-times';
    } else {
        if (icon) icon.className = 'fas fa-bars';
    }
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const hamburger = document.querySelector('.hamburger-menu');
    if (!mobileNav) return;

    mobileNav.classList.remove('active');
    if (hamburger) {
        const icon = hamburger.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileNav = document.getElementById('mobile-nav');
    const header = document.querySelector('.header');
    
    if (mobileNav && mobileNav.classList.contains('active')) {
        if (header && !header.contains(event.target)) {
            closeMobileMenu();
        }
    }
});

/**
 * Scroll and Header Animations
 */
function handleScroll() {
    const scrollProgress = document.querySelector('.scroll-progress');
    const header = document.querySelector('.header');
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (scrollProgress) scrollProgress.style.width = scrolled + "%";
        
        // Header Scroll Effect (minimal for floating bar)
        if (header) {
            if (winScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Back to Top Visibility
        if (backToTop) {
            if (winScroll > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Initialize theme and animations on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    } else {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }

    // Initialize active nav
    updateActiveNav();

    // Initialize scroll reveal
    handleReveal();
    
    // Initialize scroll handlers
    handleScroll();
    
    // Smooth page entrance
    document.body.style.opacity = '1';
});