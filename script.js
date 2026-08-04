document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       STICKY HEADER
       ========================================================================== */
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('open');
    });

    // Close menu when clicking a link inside
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('open');
        });
    });

    /* ==========================================================================
       SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       FAQ ACCORDION
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            
            // Close all other accordions
            document.querySelectorAll('.accordion-header').forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                }
            });
            
            // Toggle current accordion
            header.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    /* ==========================================================================
       ROI CALCULATOR
       ========================================================================== */
    const missedSlider = document.getElementById('missed-calls');
    const jobSlider = document.getElementById('avg-job');
    const missedVal = document.getElementById('missed-val');
    const jobVal = document.getElementById('job-val');
    const roiTotal = document.getElementById('roi-total');

    function calculateROI() {
        const missed = parseInt(missedSlider.value);
        const jobValue = parseInt(jobSlider.value);
        
        // Math: Missed calls per week * Average Job Value * 4 weeks in a month
        const monthlyRevenue = missed * jobValue * 4;
        
        // Update DOM displays
        missedVal.textContent = missed;
        jobVal.textContent = jobValue.toLocaleString();
        
        // Format Currency
        const formattedTotal = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(monthlyRevenue);
        
        roiTotal.innerHTML = `${formattedTotal}<span>/month</span>`;
        
        // Update ARIA attributes for accessibility
        missedSlider.setAttribute('aria-valuenow', missed);
        jobSlider.setAttribute('aria-valuenow', jobValue);
    }

    if(missedSlider && jobSlider) {
        missedSlider.addEventListener('input', calculateROI);
        jobSlider.addEventListener('input', calculateROI);
    }

    /* ==========================================================================
       LIGHTBOX (FOR MOCKUP SCREENSHOTS)
       ========================================================================== */
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxContent = document.querySelector('.lightbox-content');

    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = trigger.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Clone the mockup element and place it in the lightbox
                lightboxContent.innerHTML = '';
                const clone = targetElement.cloneNode(true);
                clone.removeAttribute('id'); // Prevent duplicate IDs
                lightboxContent.appendChild(clone);
                
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });

    const closeLightbox = () => {
        if(!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxContent.innerHTML = '';
        }, 300); // Wait for transition
    };

    if(lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // Close on outside click
    if(lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    /* ==========================================================================
       DYNAMIC YEAR IN FOOTER
       ========================================================================== */
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    /* ==========================================================================
       CONTACT FORM AJAX SUBMISSION (Premium UX)
       ========================================================================== */
    const form = document.querySelector('.contact-form');
    
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Stop standard HTML redirect
            
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerText;
            
            // UX: Show sending state
            submitButton.innerText = 'Sending...';
            submitButton.style.opacity = '0.7';
            submitButton.style.pointerEvents = 'none';

            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    // Success state: replace form with a nice thank you message
                    form.innerHTML = `
                        <div style="text-align: center; padding: 20px 0;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
                            <h3 style="margin-bottom: 10px;">Message Sent!</h3>
                            <p style="color: var(--c-text-secondary);">Thank you for reaching out. We will be in touch shortly with pricing and setup details.</p>
                        </div>
                    `;
                } else {
                    // Handle API error
                    console.log(response);
                    submitButton.innerText = originalButtonText;
                    submitButton.style.opacity = '1';
                    submitButton.style.pointerEvents = 'auto';
                    alert("Something went wrong. Please try again.");
                }
            })
            .catch(error => {
                // Handle network error
                console.log(error);
                submitButton.innerText = originalButtonText;
                submitButton.style.opacity = '1';
                submitButton.style.pointerEvents = 'auto';
                alert("Network error. Please check your connection and try again.");
            });
        });
    }
});
