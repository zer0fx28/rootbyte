// ROOT•BYTE Main JavaScript

// Global state management
const RootByte = {
    state: {
        articles: [],
        trendingNews: [],
        dykCards: [],
        currentDykIndex: 0
    },

    // Configuration
    config: {
        newsApiKey: null, // Will be loaded from env
        brevoApiKey: null, // Will be loaded from env
        trendingUpdateInterval: 4 * 60 * 60 * 1000, // 4 hours
        dykRotationInterval: 10000, // 10 seconds
        articlesPerPage: 9
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('🌱 ROOT•BYTE initializing...');

    // Initialize components
    initializeNavigation();
    initializeTrendingTicker();
    initializeNewsletterForm();
    initializeDYKCards();
    initializeArticleFilters();
    initializeOnThisDay();
    loadTomorrowTeaser();

    // Load data
    loadArticles();
    loadTrendingNews();
    loadDYKCards();

    // Set up auto-updates
    setInterval(loadTrendingNews, RootByte.config.trendingUpdateInterval);
    setInterval(rotateDYKCard, RootByte.config.dykRotationInterval);

    console.log('✅ ROOT•BYTE initialized successfully');
}

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav__menu--active');
            this.classList.toggle('nav__toggle--active');
        });
    }

    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('nav__menu--active');
            navToggle.classList.remove('nav__toggle--active');
        });
    });
}

// Trending news ticker
function initializeTrendingTicker() {
    const trendingContent = document.getElementById('trendingContent');

    if (trendingContent) {
        // Initialize with loading message
        trendingContent.innerHTML = '<div class="trending-ticker__item">Loading latest tech news...</div>';
    }
}

async function loadTrendingNews() {
    try {
        // In a real implementation, this would fetch from NewsAPI
        // For now, we'll use sample data
        const sampleNews = [
            'Breaking: New quantum computing breakthrough achieves 99.9% fidelity',
            'Apple announces next-generation M4 chips with enhanced AI capabilities',
            'Meta unveils new VR headset with 8K resolution and haptic feedback',
            'Google releases Gemini 2.0 with improved reasoning and coding abilities',
            'Tesla opens FSD beta to all users worldwide',
            'OpenAI announces ChatGPT-5 with multimodal capabilities'
        ];

        RootByte.state.trendingNews = sampleNews;
        updateTrendingTicker();

    } catch (error) {
        console.error('Failed to load trending news:', error);
        updateTrendingTicker(['Tech news temporarily unavailable']);
    }
}

function updateTrendingTicker() {
    const trendingContent = document.getElementById('trendingContent');
    if (!trendingContent || RootByte.state.trendingNews.length === 0) return;

    // Create scrolling ticker with all news items
    const newsString = RootByte.state.trendingNews.join(' • ');
    trendingContent.innerHTML = `<div class="trending-ticker__item">${newsString}</div>`;
}

// Newsletter form
function initializeNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;

            if (!emailInput.value) return;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                // In a real implementation, this would use Brevo API
                await simulateNewsletterSignup(emailInput.value);

                // Show success
                submitBtn.innerHTML = '<i class="fas fa-check"></i>';
                submitBtn.style.backgroundColor = 'var(--color-secondary)';
                emailInput.value = '';

                // Show success message
                showNotification('Thank you for subscribing! Check your email for confirmation.', 'success');

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                }, 3000);

            } catch (error) {
                console.error('Newsletter signup failed:', error);
                submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                submitBtn.style.backgroundColor = 'var(--color-danger)';

                showNotification('Subscription failed. Please try again.', 'error');

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }
        });
    }
}

// Simulate newsletter signup (replace with real API call)
async function simulateNewsletterSignup(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email.includes('@')) {
                resolve({ success: true });
            } else {
                reject(new Error('Invalid email'));
            }
        }, 2000);
    });
}

// Did You Know cards
function initializeDYKCards() {
    const dykPrev = document.getElementById('dykPrev');
    const dykNext = document.getElementById('dykNext');

    if (dykPrev) {
        dykPrev.addEventListener('click', () => {
            previousDYKCard();
        });
    }

    if (dykNext) {
        dykNext.addEventListener('click', () => {
            nextDYKCard();
        });
    }
}

function loadDYKCards() {
    // Sample DYK cards - in production, these could be loaded from a CMS or API
    const sampleDYKCards = [
        {
            fact: "The first computer bug was an actual bug—a moth trapped in Harvard's Mark II computer in 1947.",
            tag: "History"
        },
        {
            fact: "The term 'cookie' in web development comes from 'magic cookie,' a Unix term for data tokens.",
            tag: "Web"
        },
        {
            fact: "CAPTCHA stands for 'Completely Automated Public Turing test to tell Computers and Humans Apart.'",
            tag: "Security"
        },
        {
            fact: "The first domain name ever registered was symbolics.com on March 15, 1985.",
            tag: "Internet"
        },
        {
            fact: "Python programming language was named after Monty Python's Flying Circus, not the snake.",
            tag: "Programming"
        }
    ];

    RootByte.state.dykCards = sampleDYKCards;
    displayCurrentDYKCard();
}

function displayCurrentDYKCard() {
    const dykCards = document.getElementById('dykCards');
    if (!dykCards || RootByte.state.dykCards.length === 0) return;

    const currentCard = RootByte.state.dykCards[RootByte.state.currentDykIndex];

    dykCards.innerHTML = `
        <div class="dyk-card dyk-card--active">
            <p class="dyk-card__fact">${currentCard.fact}</p>
            <div class="dyk-card__tag">${currentCard.tag}</div>
        </div>
    `;
}

function nextDYKCard() {
    RootByte.state.currentDykIndex = (RootByte.state.currentDykIndex + 1) % RootByte.state.dykCards.length;
    displayCurrentDYKCard();
}

function previousDYKCard() {
    RootByte.state.currentDykIndex = RootByte.state.currentDykIndex === 0
        ? RootByte.state.dykCards.length - 1
        : RootByte.state.currentDykIndex - 1;
    displayCurrentDYKCard();
}

function rotateDYKCard() {
    if (RootByte.state.dykCards.length > 0) {
        nextDYKCard();
    }
}

// Article filters
function initializeArticleFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('filter-btn--active'));

            // Add active class to clicked button
            this.classList.add('filter-btn--active');

            // Filter articles
            const category = this.dataset.category;
            filterArticles(category);
        });
    });
}

function filterArticles(category) {
    const articles = document.querySelectorAll('.article-card');

    articles.forEach(article => {
        if (category === 'all') {
            article.style.display = 'block';
        } else {
            const articleCategory = article.querySelector('.article-card__category')?.textContent.toLowerCase();
            article.style.display = articleCategory === category ? 'block' : 'none';
        }
    });
}

// Load articles
function loadArticles() {
    // In production, this would load from a CMS or markdown files
    // For now, we're using the sample articles already in the HTML
    console.log('Articles loaded from static content');
}

// On This Day functionality
function initializeOnThisDay() {
    loadOnThisDay();
}

function loadOnThisDay() {
    const onThisDayContent = document.getElementById('onThisDayContent');
    if (!onThisDayContent) return;

    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const day = today.getDate();

    // Sample tech history events - in production, this could be a comprehensive database
    const techHistory = {
        'February 18': {
            1996: 'The first web browser for mobile devices was released, laying the foundation for mobile internet as we know it today.'
        },
        'February 19': {
            1878: 'Thomas Edison patents the phonograph, the first device to both record and reproduce sound.'
        }
    };

    const dateKey = `${month} ${day}`;
    const event = techHistory[dateKey];

    if (event) {
        const year = Object.keys(event)[0];
        const description = event[year];

        onThisDayContent.innerHTML = `
            <div class="on-this-day__date">${month} ${day}, ${year}</div>
            <div class="on-this-day__event">${description}</div>
        `;
    } else {
        onThisDayContent.innerHTML = `
            <div class="on-this-day__date">${month} ${day}</div>
            <div class="on-this-day__event">No significant tech events recorded for this date in our database.</div>
        `;
    }
}

// Tomorrow's teaser
function loadTomorrowTeaser() {
    // In production, this would be managed through the CMS or a scheduling system
    console.log('Tomorrow teaser loaded from static content');
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <span class="notification__message">${message}</span>
            <button class="notification__close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add notification styles if they don't exist
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
                border-left: 4px solid var(--color-primary);
            }
            .notification--success { border-left-color: var(--color-secondary); }
            .notification--error { border-left-color: var(--color-danger); }
            .notification__content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            .notification__close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                color: var(--color-text-muted);
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Performance optimization
function optimizeImages() {
    // Lazy load images when they come into viewport
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Analytics tracking (placeholder)
function trackPageView(page) {
    // In production, this would integrate with Google Analytics
    console.log(`Page view tracked: ${page}`);
}

function trackEvent(category, action, label) {
    // In production, this would integrate with Google Analytics
    console.log(`Event tracked: ${category} - ${action} - ${label}`);
}

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu && navToggle) {
            navMenu.classList.remove('nav__menu--active');
            navToggle.classList.remove('nav__toggle--active');
        }
    }

    // Arrow keys for DYK navigation
    if (e.key === 'ArrowLeft') {
        previousDYKCard();
    } else if (e.key === 'ArrowRight') {
        nextDYKCard();
    }
});

// Dark mode toggle (future feature)
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (darkModeToggle) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
        });
    }
}

// Export for global access
window.RootByte = RootByte;