// ===========================
// NAVIGATION MENU TOGGLE
// ===========================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Toggle mobile menu when hamburger is clicked
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when a nav link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===========================
// CTA BUTTON FUNCTIONALITY
// ===========================

const ctaButton = document.getElementById('ctaButton');

ctaButton.addEventListener('click', () => {
    // Scroll to contact section
    const contactSection = document.querySelector('#contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Visual feedback
    ctaButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        ctaButton.style.transform = 'scale(1)';
    }, 100);
});

// ===========================
// SCROLL ANIMATIONS
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards for scroll animation
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    observer.observe(card);
});

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================

let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow on scroll
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 10px 35px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 10px 35px rgba(0, 0, 0, 0.1)';
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// ===========================
// SMOOTH SCROLL POLYFILL
// ===========================

// Fallback for browsers that don't support smooth scroll
if (!window.CSS || !window.CSS.supports('scroll-behavior: smooth')) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'auto',
                    block: 'start'
                });
            }
        });
    });
}

// ===========================
// FORM INTERACTION (Future Enhancement)
// ===========================

// This function can be used when you add a contact form
function handleFormSubmit(e) {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted');
    // Example: Show success message
    alert('Thank you for reaching out! I will get back to you soon.');
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Add active state to current nav link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ===========================
// PAGE LOAD ANIMATION
// ===========================

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code here
    console.log('Wellness & Vitality website loaded successfully');
});
