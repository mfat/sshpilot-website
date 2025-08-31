// Simple theme switching for sshPilot v2

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = this.getStoredTheme() || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard shortcut for theme toggle (Ctrl/Cmd + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    getStoredTheme() {
        return localStorage.getItem('sshpilot-theme');
    }

    setStoredTheme(theme) {
        localStorage.setItem('sshpilot-theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
        this.setStoredTheme(theme);
        this.currentTheme = theme;
    }

    updateThemeIcon(theme) {
        const icon = theme === 'dark' ? '☀️' : '🌙';
        this.themeToggle.textContent = icon;
        this.themeToggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add some subtle animations
document.addEventListener('DOMContentLoaded', () => {
    // Fade in elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for fade-in effect
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Add loading state for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        
        img.addEventListener('error', () => {
            img.style.opacity = '0.5';
            img.style.filter = 'grayscale(100%)';
        });
        
        // Set initial state
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
    });
});

// Add focus management for better accessibility
document.addEventListener('DOMContentLoaded', () => {
    // Skip to main content link (for screen readers)
    const skipLink = document.createElement('a');
    skipLink.href = '#about';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--accent);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
});

// Add some old-school touches
document.addEventListener('DOMContentLoaded', () => {
    // Add a subtle text selection effect
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            document.body.style.cursor = 'text';
        } else {
            document.body.style.cursor = 'default';
        }
    });
    
    // Add a simple "under construction" effect for fun
    const addConstructionEffect = () => {
        const constructionText = document.createElement('div');
        constructionText.textContent = '🚧 Built with monospace fonts 🚧';
        constructionText.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: var(--accent);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            opacity: 0.8;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(constructionText);
        
        // Remove after 3 seconds
        setTimeout(() => {
            constructionText.remove();
        }, 3000);
    };
    
    // Show construction effect on first visit
    if (!localStorage.getItem('sshpilot-visited')) {
        setTimeout(addConstructionEffect, 1000);
        localStorage.setItem('sshpilot-visited', 'true');
    }
});
