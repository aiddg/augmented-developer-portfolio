// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- GSAP & ScrollTrigger Registration ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.error("GSAP or ScrollTrigger is not loaded! Animations will not work.");
        // Fallback to make body visible if GSAP fails
        document.body.style.opacity = '1';
        const preloader = document.getElementById('preloader');
        if(preloader) preloader.classList.add('loaded');
        return; 
    }

    // --- Theme Toggle ---
    const K_DARK_MODE_KEY = 'darkMode_AugmentedDev_Portfolio_Global_Final_Ext'; // Consistent Key
    const htmlElement = document.documentElement;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    const moonIcons = [document.getElementById('moonIcon'), document.getElementById('moonIconMobile')];
    const sunIcons = [document.getElementById('sunIcon'), document.getElementById('sunIconMobile')];
    const darkModeToggleTextMobile = document.getElementById('darkModeToggleTextMobile');

    function applyTheme(isDark, isInitialLoad = false) {
        htmlElement.classList.toggle('dark', isDark);
        moonIcons.forEach(icon => icon && icon.classList.toggle('hidden', !isDark));
        sunIcons.forEach(icon => icon && icon.classList.toggle('hidden', isDark));
        if (darkModeToggleTextMobile) darkModeToggleTextMobile.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        
        if (!isInitialLoad) {
            document.querySelectorAll('.section-bg-lines-canvas').forEach(canvasEl => {
                if (canvasEl.drawLinesAPI && typeof canvasEl.drawLinesAPI.updateColor === 'function') {
                    const color = isDark ? canvasEl.dataset.colorDark : canvasEl.dataset.colorLight;
                    canvasEl.drawLinesAPI.updateColor(color);
                }
            });
        }
    }

    function toggleTheme() {
        const isCurrentlyDark = htmlElement.classList.contains('dark');
        localStorage.setItem(K_DARK_MODE_KEY, !isCurrentlyDark);
        applyTheme(!isCurrentlyDark, false);
    }

    let preferredTheme = localStorage.getItem(K_DARK_MODE_KEY);
    let initialIsDark = preferredTheme === null ? true : preferredTheme === 'true'; 
    applyTheme(initialIsDark, true); 

    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleTheme);
    if (darkModeToggleMobile) darkModeToggleMobile.addEventListener('click', toggleTheme);

    // --- Particle Background (Homepage only logic inside) ---
    const particleContainer = document.getElementById('particle-container');
    function createParticles() {
        if (!particleContainer) return; // Only run if element exists
        particleContainer.innerHTML = ''; 
        const numParticles = 60; 
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < numParticles; i++) {
            let particle = document.createElement('div');
            particle.classList.add('particle');
            let x = Math.random() * 100;
            let y = Math.random() * 100;
            let size = Math.random() * 2.5 + 0.5;
            let duration = Math.random() * 30 + 20; 
            let delay = Math.random() * 20;

            particle.style.setProperty('--tx-start', `${x}vw`);
            particle.style.setProperty('--ty-start', `${y}vh`);
            particle.style.setProperty('--tx-end', `${x + (Math.random() - 0.5) * 50}vw`); 
            particle.style.setProperty('--ty-end', `${y + (Math.random() - 0.5) * 50}vh`);
            particle.style.setProperty('--op-start', `${Math.random() * 0.3 + 0.05}`); 
            particle.style.setProperty('--scale-end', `${Math.random() * 0.5 + 0.3}`);
            
            particle.style.cssText += `
                position: absolute; left: var(--tx-start); top: var(--ty-start);
                width: ${size}px; height: ${size}px;
                background-color: var(--accent-glow);
                animation: moveParticle ${duration}s linear infinite alternate;
                animation-delay: -${delay}s;
            `;
            fragment.appendChild(particle);
        }
        particleContainer.appendChild(fragment);
    }
    if (document.body.contains(particleContainer)) { // Check if particle container exists on the current page
        createParticles();
    }

    // --- Animated Background Lines (Canvas) ---
    function drawAnimatedLines(canvas, color) {
        if (!canvas || typeof canvas.getContext !== 'function') return; 
        const ctx = canvas.getContext('2d');
        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        
        let resizeTimeout;
        function onResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                width = canvas.offsetWidth;
                height = canvas.offsetHeight;
                if (width === 0 || height === 0) return; 
                canvas.width = width * window.devicePixelRatio;
                canvas.height = height * window.devicePixelRatio;
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            }, 100);
        }
        window.addEventListener('resize', onResize);
        
        if (width > 0 && height > 0) {
             canvas.width = width * window.devicePixelRatio;
             canvas.height = height * window.devicePixelRatio;
             ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        } else { 
            setTimeout(onResize, 50); 
        }

        let lines = canvas.lines || []; 
        if (!canvas.lines || lines.length === 0) { 
            const numLines = Math.max(15, Math.floor(width / 60)); 
            for (let i = 0; i < numLines; i++) {
                lines.push({
                    x: Math.random() * width, y: Math.random() * height,
                    length: Math.random() * height * 0.25 + height * 0.05, 
                    angle: (Math.random() - 0.5) * 0.1 - Math.PI / 2, 
                    speed: Math.random() * 0.15 + 0.03, 
                    opacity: Math.random() * 0.1 + 0.02, color: color
                });
            }
            canvas.lines = lines;
        }
        lines.forEach(line => line.color = color); 
        
        let animationFrameId;
        function updateLineColor(newColor) { lines.forEach(line => line.color = newColor); }

        function animate() {
            if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) { 
                animationFrameId = requestAnimationFrame(animate); return;
            }
            ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio); 
            lines.forEach(line => {
                ctx.beginPath(); ctx.moveTo(line.x, line.y);
                ctx.lineTo(line.x + Math.cos(line.angle) * line.length, line.y + Math.sin(line.angle) * line.length);
                ctx.strokeStyle = line.color; ctx.lineWidth = 0.4; 
                ctx.globalAlpha = line.opacity; ctx.stroke();
                line.y += line.speed * (Math.sin(line.angle) > 0 ? 1 : -1); 
                line.x += line.speed * (Math.cos(line.angle) > 0 ? 1 : -1) * 0.2; 
                if (line.y > height + line.length || line.y < -line.length) {
                     line.y = Math.sin(line.angle) > 0 ? -line.length : height + line.length; 
                     line.x = Math.random() * width; line.opacity = Math.random() * 0.1 + 0.02;
                }
            });
            animationFrameId = requestAnimationFrame(animate);
        }
        if (canvas.animationFrameId) cancelAnimationFrame(canvas.animationFrameId);
        animate();
        canvas.animationFrameId = animationFrameId;
        canvas.drawLinesAPI = { updateColor: updateLineColor };
    }
    
    document.querySelectorAll('.section-bg-lines-canvas').forEach(canvasEl => {
        setTimeout(() => { 
            if (canvasEl.offsetWidth > 0 && canvasEl.offsetHeight > 0) {
                const color = htmlElement.classList.contains('dark') ? canvasEl.dataset.colorDark : canvasEl.dataset.colorLight;
                drawAnimatedLines(canvasEl, color);
            }
        }, 50); 
    });

    // --- Navbar Scroll & Active Link ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.nav-link-mobile');

    function updateActiveLink() {
        if (!navbar) return; 
        let currentSectionId = "";
        const sections = document.querySelectorAll('main section[id]'); // Only sections in main
        const navHeight = navbar.offsetHeight;
        const scrollPosition = window.pageYOffset;

        if (window.location.pathname.endsWith('projects.html')) {
            currentSectionId = 'projects-page'; 
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight - Math.min(100, window.innerHeight * 0.2);
                const sectionBottom = sectionTop + section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            });
            if (!currentSectionId && scrollPosition < (sections.length > 0 ? sections[0].offsetTop - navHeight - 70 : window.innerHeight)) {
                 currentSectionId = 'home';
            } else if (!currentSectionId && sections.length === 0 && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
                 currentSectionId = 'home';
            }
        }

        const allLinks = [...navLinks, ...mobileNavLinks];
        allLinks.forEach(link => {
            link.classList.remove('active-nav-link', 'font-semibold', 'dark:text-brand-primary', 'text-brand-secondary', 'text-brand-primary');
            
            const linkHref = link.getAttribute('href');
            const linkIsForProjectsPage = linkHref === 'projects.html';
            const linkSectionId = linkHref.includes('#') ? linkHref.substring(linkHref.lastIndexOf('#') + 1) : null;

            if (linkIsForProjectsPage && currentSectionId === 'projects-page') {
                link.classList.add('active-nav-link', 'font-semibold');
                htmlElement.classList.contains('dark') ? link.classList.add('dark:text-brand-primary') : link.classList.add('text-brand-secondary');
            } else if (linkSectionId && linkSectionId === currentSectionId) {
                link.classList.add('active-nav-link', 'font-semibold');
                htmlElement.classList.contains('dark') ? link.classList.add('dark:text-brand-primary') : link.classList.add('text-brand-secondary');
            }
        });
    }
    
    window.addEventListener('scroll', () => {
        if (navbar && window.pageYOffset > 20) {
            navbar.classList.add('nav-scrolled', 'shadow-2xl');
            navbar.classList.remove('py-3'); navbar.classList.add('py-2.5');
        } else if (navbar) {
            navbar.classList.remove('nav-scrolled', 'shadow-2xl');
            navbar.classList.remove('py-2.5'); navbar.classList.add('py-3');
        }
        updateActiveLink();
    });
    updateActiveLink(); // Initial check
    

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // --- Footer: Current Year ---
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    // --- AI Co-creator Toggle ---
    const aiCoCreatorButton = document.getElementById('aiCoCreatorButton');
    const aiCoCreatorInfo = document.getElementById('ai-cocreator-info');
    if (aiCoCreatorButton && aiCoCreatorInfo) {
        aiCoCreatorButton.addEventListener('click', () => {
            aiCoCreatorInfo.classList.toggle('expanded');
        });
    }
    
    // --- Page Specific Animations ---
    function attachCardHover(cardSelector) { // Added cardSelector parameter
        const cardsToAnimate = document.querySelectorAll(cardSelector); // Use the selector
        cardsToAnimate.forEach(card => {
            // Removed gsap.killTweensOf(card); based on previous findings

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const rotateX = (y / rect.height) * -20; // Increased from -10
                const rotateY = (x / rect.width) * 20;  // Increased from 10
                
                gsap.to(card, { 
                    rotationX: rotateX,
                    rotationY: rotateY,
                    transformPerspective: 1200, 
                    ease: "power1.out",
                    duration: 0.5
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, { 
                    rotationX: 0,
                    rotationY: 0,
                    ease: "elastic.out(1, 0.5)", 
                    duration: 1
                });
            });
        });
    }

    function initHomepageAnimations() {
        if (!document.getElementById('home')) return; 

        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) { 
            const line1Spans = heroTitle.querySelectorAll('.line-1 span');
            const line2Spans = heroTitle.querySelectorAll('.line-2 span');
            
            if (line1Spans.length > 0) {
                gsap.fromTo(line1Spans,
                    { opacity: 0, y: 40, rotationX: -100, filter: 'blur(5px)' },
                    {
                        opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)', stagger: 0.05, duration: 1, ease: "expo.out", delay: 0.3
                    }
                );
            }
            if (line2Spans.length > 0) {
                gsap.fromTo(line2Spans,
                    { opacity: 0, y: 40, rotationX: -100, filter: 'blur(5px)' },
                    {
                        opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)', stagger: 0.05, duration: 1, ease: "expo.out", delay: 0.6 
                    }
                );
            }
        }

        const heroElementsTimeline = gsap.timeline({ delay: 1.0 }); 
        heroElementsTimeline
            .fromTo(".hero-subtitle", { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
            .fromTo(".hero-description", { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .fromTo(".hero-buttons", { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");

        gsap.from("#featured-projects .project-card", {
            opacity: 0, y: 60, scale: 0.9, stagger: 0.18, duration: 0.9, ease: "expo.out",
            scrollTrigger: {
                trigger: "#featured-projects .grid", 
                start: "top 85%", toggleActions: "play none none none", once: true
            }
        });

        attachCardHover('#featured-projects .project-card'); // Call with selector for homepage cards
    }

    function initProjectsPageAnimations() {
        if (!document.getElementById('all-projects')) return; 
        
        gsap.from("#project-gallery .project-card:not(.hidden-by-filter)", { 
            opacity: 0, y: 60, scale: 0.9, stagger: 0.1, duration: 0.7, ease: "expo.out",
            scrollTrigger: {
                trigger: "#project-gallery",
                start: "top 85%", toggleActions: "play none none none", once: true
            }
        });
        attachCardHover('#project-gallery .project-card'); // Call with selector for project page cards
    }
    
    function initCommonAnimations() {
        document.querySelectorAll('.section-title').forEach(title => {
            ScrollTrigger.create({
                trigger: title, start: "top 88%",
                onEnter: () => title.querySelector('.section-title-underline')?.classList.add('visible'),
                once: true
            });
        });

        gsap.utils.toArray('section > .container > *:not(.section-title):not(.grid):not(.max-w-3xl):not(.project-card), section > .container > div > *:not(.section-title):not(.grid):not(.max-w-3xl):not(.project-card)').forEach((elem) => { // Excluded .project-card
            if (!elem.closest('.hero-title, .hero-subtitle, .hero-description, .hero-buttons')) { 
                gsap.fromTo(elem,
                    { opacity: 0, y: 60, filter: 'blur(3px)' },
                    {
                        opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: "expo.out",
                        scrollTrigger: { trigger: elem, start: "top 90%", toggleActions: "play none none none", once: true }
                    }
                );
            }
        });
        
        // Remove or comment out the project card animations from here, as they are now handled in initHomepageAnimations and will be for initProjectsPageAnimations
        /*
        const cards = document.querySelectorAll('.project-card'); 
        cards.forEach(card => {
            const inner = card.querySelector('.project-card-inner');
            if(inner) {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    const rotateX = (y / rect.height) * -7; 
                    const rotateY = (x / rect.width) * 7;
                    gsap.to(inner, {
                        rotationX: rotateX, rotationY: rotateY, transformPerspective: 1200,
                        ease: "power1.out", duration: 0.5
                    });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(inner, { rotationX: 0, rotationY: 0, ease: "elastic.out(1, 0.5)", duration: 1 });
                });
            }
        });
        */
    }

    // --- Project Filtering (Only for projects.html) ---
    const filterButtonsContainer = document.getElementById('filter-buttons');
    const projectCards = document.querySelectorAll('#project-gallery .project-card'); // Will be empty on index.html
    const projectGallery = document.getElementById('project-gallery'); // Will be null on index.html

    if (filterButtonsContainer && projectCards.length > 0 && projectGallery) {
        filterButtonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button.filter-btn');
            if (button && !button.classList.contains('active')) {
                const currentActive = filterButtonsContainer.querySelector('.active');
                if(currentActive) {
                    currentActive.classList.remove('active');
                    currentActive.setAttribute('aria-pressed', 'false'); 
                }
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');

                const filterValue = button.dataset.filter;
                let showDelay = 0;
                
                projectCards.forEach(card => {
                    const categories = card.dataset.category.split(' ');
                    const shouldShow = (filterValue === 'all' || categories.includes(filterValue));
                    
                    card.classList.add('gsap-animating');

                    if (shouldShow) {
                        if (card.classList.contains('hidden-by-filter') || gsap.getProperty(card, "opacity") === 0) {
                            card.classList.remove('hidden-by-filter');
                            gsap.set(card, { display: 'flex', opacity: 0, scale: 0.95, y: 20 });
                            gsap.to(card, { 
                                opacity: 1, scale: 1, y: 0, 
                                duration: 0.4, delay: showDelay, ease: "power2.out",
                                onComplete: () => card.classList.remove('gsap-animating')
                            });
                            showDelay += 0.07;
                        } else { 
                             gsap.set(card, { display: 'flex', opacity: 1, scale: 1, y: 0 });
                             card.classList.remove('gsap-animating');
                        }
                    } else {
                        gsap.to(card, { 
                            opacity: 0, scale: 0.95, y: 20, 
                            duration: 0.3, ease: "power2.in", 
                            onComplete: () => {
                                card.classList.add('hidden-by-filter');
                                gsap.set(card, { display: 'none' }); 
                                card.classList.remove('gsap-animating');
                            }
                        });
                    }
                });
                setTimeout(() => ScrollTrigger.refresh(), (showDelay * 1000) + 400);
            }
        });
    }

    // --- Preloader and Initial Page Load ---
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => { 
                preloader.classList.add('loaded');
                gsap.to('body', {
                    opacity: 1,
                    duration: 0.8, 
                    ease: 'power1.inOut',
                    onComplete: () => {
                        if (typeof initHomepageAnimations === 'function' && document.getElementById('home')) {
                            initHomepageAnimations(); // This will now set up its own card animations
                        }
                        if (typeof initProjectsPageAnimations === 'function' && document.getElementById('all-projects')) {
                            initProjectsPageAnimations(); // TODO: Add similar card animation setup here if needed
                        }
                        if (typeof initCommonAnimations === 'function') {
                            initCommonAnimations(); 
                        }
                        setTimeout(updateActiveLink, 150); 
                    }
                });
            }, 1800); 
        } else { 
            document.body.style.opacity = 1; // Make body visible immediately if no preloader
            if (typeof initHomepageAnimations === 'function' && document.getElementById('home')) initHomepageAnimations();
            if (typeof initProjectsPageAnimations === 'function' && document.getElementById('all-projects')) initProjectsPageAnimations();
            if (typeof initCommonAnimations === 'function') initCommonAnimations();
            setTimeout(updateActiveLink, 150);
        }
    });
    
    // --- Smooth Page Transition (Simulated) ---
    document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"])').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Check if it's an internal page link and not the current page path
            if (href && (href.endsWith('.html') || !href.includes('.')) && href !== window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1)) {
                e.preventDefault();
                gsap.to('body', {
                    opacity: 0,
                    duration: 0.4, 
                    ease: 'power1.easeOut',
                    onComplete: () => { window.location.href = href; }
                });
            }
        });
    });
    
    // Fade in on pageshow (handles bfcache)
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) { // True if page is from bfcache
             if (document.body.style.opacity !== '1') { // Only if not already visible
                 gsap.set('body', { opacity: 0 }); 
                 gsap.to('body', { opacity: 1, duration: 0.5, ease: 'power1.easeIn' });
            }
        }
    });

}); // End of DOMContentLoaded
