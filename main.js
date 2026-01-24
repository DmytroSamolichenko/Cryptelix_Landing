/**
 * Cryptelix Landing Page - Main JavaScript
 * Handles i18n, smooth scrolling, animations, and interactions
 */

// ============================================
// Global State
// ============================================
let currentLanguage = 'en';
let translations = {};

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Load translations
    await loadTranslations();
    
    // Set initial language (check localStorage or default to 'en')
    const savedLang = localStorage.getItem('cryptelix-lang') || 'en';
    switchLanguage(savedLang);
    
    // Initialize components
    initSmoothScrolling();
    initScrollAnimations();
    initNavbar();
    initMobileMenu();
    initLanguageSwitcher();
    initCTAButtons();
    initSloganReveals();
    initStatisticsCounter();
    
    // Set initial animations
    animateHero();
}

// ============================================
// Internationalization (i18n)
// ============================================

/**
 * Load translation files
 */
async function loadTranslations() {
    try {
        const [enResponse, uaResponse] = await Promise.all([
            fetch('i18n/en.json'),
            fetch('i18n/ua.json')
        ]);
        
        translations.en = await enResponse.json();
        translations.ua = await uaResponse.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback: use inline translations if files fail to load
        translations.en = getFallbackTranslations('en');
        translations.ua = getFallbackTranslations('ua');
    }
}

/**
 * Switch language
 * @param {string} lang - Language code ('en' or 'ua')
 */
function switchLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Translations for ${lang} not loaded`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('cryptelix-lang', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang === 'ua' ? 'uk' : 'en';
    
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(translations[lang], key);
        if (translation) {
            // Preserve button/input types
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Get nested translation value
 * @param {object} obj - Translation object
 * @param {string} path - Dot-separated path (e.g., 'nav.logo')
 * @returns {string} Translation value
 */
function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

/**
 * Fallback translations (in case JSON files fail to load)
 */
function getFallbackTranslations(lang) {
    // This would be a minimal fallback - in production, ensure JSON files are accessible
    return translations[lang] || {};
}

// ============================================
// Language Switcher
// ============================================
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

// ============================================
// Smooth Scrolling
// ============================================
function initSmoothScrolling() {
    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip empty hash or just '#'
            if (href === '#' || href === '') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
                
                // Calculate offset for fixed navbar
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
    // Create Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.getAttribute('data-delay') || 0;
                
                // Apply animation with delay
                setTimeout(() => {
                    element.classList.add('animated');
                }, delay);
                
                // Unobserve after animation to improve performance
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// Slogan Reveal - Cinematic Scroll Animation
// ============================================
function initSloganReveals() {
    const slogans = document.querySelectorAll('.slogan-reveal');
    
    if (slogans.length === 0) return;
    
    // Create Intersection Observer for slogan reveals
    const sloganObserverOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -20% 0px'
    };
    
    const sloganObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const slogan = entry.target;
            
            if (entry.isIntersecting) {
                // Add revealed class with a slight delay for cinematic effect
                setTimeout(() => {
                    slogan.classList.add('revealed');
                }, 200);
            } else {
                // Optionally remove revealed class when out of view
                // slogan.classList.remove('revealed');
            }
        });
    }, sloganObserverOptions);
    
    // Observe all slogan elements
    slogans.forEach(slogan => {
        sloganObserver.observe(slogan);
    });
    
    // Also handle scroll events for parallax effect
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateSloganParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateSloganParallax() {
    const slogans = document.querySelectorAll('.slogan-reveal');
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    slogans.forEach((slogan, index) => {
        const section = slogan.closest('.slogan-section');
        if (!section) return;
        
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionCenter = sectionTop + sectionHeight / 2;
        const distanceFromCenter = scrollY + windowHeight / 2 - sectionCenter;
        
        // Parallax effect - subtle movement
        const parallaxOffset = distanceFromCenter * 0.15;
        if (slogan.classList.contains('revealed')) {
            slogan.style.transform = `translateY(${parallaxOffset}px)`;
        }
        
        // Fade based on distance from viewport center
        const distance = Math.abs(distanceFromCenter);
        const maxDistance = windowHeight * 1.5;
        const opacity = Math.max(0, Math.min(1, 1 - distance / maxDistance));
        
        if (slogan.classList.contains('revealed')) {
            slogan.style.opacity = opacity;
        }
    });
}

// ============================================
// Navbar Scroll Effect
// ============================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when scrolling down
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link, .nav-cta-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

// ============================================
// Hero Animation
// ============================================
function animateHero() {
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroContent) {
        setTimeout(() => {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(30px)';
            heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            
            requestAnimationFrame(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            });
        }, 100);
    }
    
    if (heroVisual) {
        setTimeout(() => {
            heroVisual.style.opacity = '0';
            heroVisual.style.transform = 'translateX(30px)';
            heroVisual.style.transition = 'opacity 1s ease, transform 1s ease';
            
            requestAnimationFrame(() => {
                heroVisual.style.opacity = '1';
                heroVisual.style.transform = 'translateX(0)';
            });
        }, 300);
    }
}

// ============================================
// CTA Buttons
// ============================================
function initCTAButtons() {
    const ctaButtons = document.querySelectorAll('.btn-primary, .nav-cta-btn');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Handle CTA action (e.g., open waitlist form, redirect, etc.)
            // For now, just scroll to CTA section if not already there
            const ctaSection = document.getElementById('cta');
            if (ctaSection && !button.closest('#cta')) {
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = ctaSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Performance Optimizations
// ============================================

// Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll handler
const optimizedScrollHandler = throttle(() => {
    // Navbar scroll effect is already handled
}, 10);

window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// ============================================
// Accessibility Enhancements
// ============================================

// Keyboard navigation for language switcher
document.addEventListener('keydown', (e) => {
    // Allow Enter/Space to activate language buttons
    if (e.target.classList.contains('lang-btn')) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.target.click();
        }
    }
});

// Focus management for mobile menu
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        if (e.key === 'Escape') {
            const navMenu = document.getElementById('navMenu');
            const navToggle = document.getElementById('navToggle');
            if (navMenu) navMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
            navToggle?.focus();
        }
    });
}

// Apply focus trap to mobile menu when open
const navMenu = document.getElementById('navMenu');
if (navMenu) {
    const observer = new MutationObserver(() => {
        if (navMenu.classList.contains('active')) {
            trapFocus(navMenu);
        }
    });
    observer.observe(navMenu, { attributes: true, attributeFilter: ['class'] });
}

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // In production, you might want to log this to an error tracking service
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ============================================
// Statistics Counter Animation
// ============================================
function initStatisticsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length === 0) return;
    
    // Create Intersection Observer for counter animation
    const counterObserverOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, counterObserverOptions);
    
    // Observe all stat number elements
    statNumbers.forEach(stat => {
        counterObserver.observe(stat);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (ease-out cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (target - startValue) * easeOutCubic);
        
        // Update the displayed number (suffix is handled by CSS ::after)
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            // Ensure final value is exact
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}
