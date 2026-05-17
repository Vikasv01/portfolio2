document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    let currentTheme = 'dark';
    try {
        currentTheme = localStorage.getItem('theme') || 'dark';
    } catch (e) {
        console.warn("localStorage blocked on local file protocol");
    }
    htmlElement.setAttribute('data-theme', currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', currentTheme);
            try {
                localStorage.setItem('theme', currentTheme);
            } catch (e) {}
        });
    }
    // --- SICK Interactive Galaxy Vortex (The Shockwave One) ---
    const canvas = document.getElementById('bg-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        function getThemeColors(theme) {
            if (theme === 'light') return ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']; // Elegant blues/purples/pink
            return ['#00f3ff', '#9d00ff', '#ff00ea', '#fffb00']; // Neon Cyberpunk
        }
        let currentColors = getThemeColors(currentTheme);

        if(themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                // currentTheme is already updated by the listener at the top of the file
                currentColors = getThemeColors(currentTheme);
            });
        }

        let mouse = { x: width/2, y: height/2, vx: 0, vy: 0 };
        let lastMouse = { x: width/2, y: height/2 };
        
        window.addEventListener('mousemove', (e) => {
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.vx = mouse.x - lastMouse.x;
            mouse.vy = mouse.y - lastMouse.y;
        });

        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });

        // Add shockwave on click ("one click and everything spreads away")
        let shockwaves = [];
        window.addEventListener('click', (e) => {
            shockwaves.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: 600, speed: 20 });
        });

        class Particle {
            constructor() {
                this.reset();
                this.x = Math.random() * width; // Initial random scatter
                this.y = Math.random() * height;
            }
            
            reset() {
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.baseSize = Math.random() * 1.5 + 0.5;
                this.size = this.baseSize;
                this.color = currentColors[Math.floor(Math.random() * currentColors.length)];
            }

            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Vortex math: suck in and swirl
                if (dist < 300) {
                    const force = (300 - dist) / 300;
                    // Pull towards mouse
                    this.vx += (dx / dist) * force * 0.8;
                    this.vy += (dy / dist) * force * 0.8;
                    
                    // Swirl around mouse (perpendicular force)
                    this.vx += (dy / dist) * force * 2.0;
                    this.vy -= (dx / dist) * force * 2.0;
                }
                
                // Mouse movement drag
                if (dist < 100) {
                    this.vx += mouse.vx * 0.1;
                    this.vy += mouse.vy * 0.1;
                }
                
                // Shockwave blast
                for (let s of shockwaves) {
                    const sdx = this.x - s.x;
                    const sdy = this.y - s.y;
                    const sDist = Math.sqrt(sdx*sdx + sdy*sdy);
                    if (Math.abs(sDist - s.radius) < 30) {
                        const blastForce = (s.maxRadius - s.radius) / s.maxRadius;
                        this.vx += (sdx / sDist) * 15 * blastForce;
                        this.vy += (sdy / sDist) * 15 * blastForce;
                    }
                }

                // Friction limits infinite speed
                this.vx *= 0.95;
                this.vy *= 0.95;

                this.x += this.vx;
                this.y += this.vy;

                // Screen wrap
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
                
                // Update color if theme changed
                if (Math.random() < 0.01) {
                    this.color = currentColors[Math.floor(Math.random() * currentColors.length)];
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                // Glow brighter based on speed
                const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
                ctx.globalAlpha = Math.min(1, speed * 0.15 + 0.2); 
                ctx.fill();
            }
        }

        const particles = [];
        for(let i=0; i<900; i++) { // 900 particles for a dense galaxy
            particles.push(new Particle());
        }

        function animateGalaxy() {
            // Trailing effect instead of clearRect
            ctx.fillStyle = currentTheme === 'dark' ? 'rgba(10, 10, 10, 0.15)' : 'rgba(249, 250, 251, 0.15)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.globalCompositeOperation = currentTheme === 'dark' ? 'lighter' : 'source-over';

            for (let p of particles) {
                p.update();
                p.draw();
            }
            
            ctx.globalCompositeOperation = 'source-over';

            // Update shockwaves
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                let s = shockwaves[i];
                s.radius += s.speed;
                
                // Draw shockwave ring
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
                ctx.lineWidth = 3;
                ctx.strokeStyle = `rgba(59, 130, 246, ${1 - s.radius/s.maxRadius})`;
                ctx.stroke();

                if (s.radius > s.maxRadius) {
                    shockwaves.splice(i, 1);
                }
            }
            
            // Glowing cursor core
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI*2);
            ctx.fillStyle = currentTheme === 'dark' ? '#fff' : '#2563eb';
            ctx.shadowBlur = 20;
            ctx.shadowColor = currentColors[0];
            ctx.fill();
            ctx.shadowBlur = 0;
            
            requestAnimationFrame(animateGalaxy);
        }
        animateGalaxy();
    }

    // --- Intersection Observer Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', 
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-tag, .reveal-hero, .reveal-nav').forEach(el => observer.observe(el));

    // --- Audio Player Logic ---
    const bgAudio = document.getElementById('bg-audio');
    const audioToggle = document.getElementById('audio-toggle');

    if (bgAudio && audioToggle) {
        // 4 Levels of Sound
        const volumeLevels = [
            { vol: 0, icon: 'fa-volume-mute' },
            { vol: 0.3, icon: 'fa-volume-off' },
            { vol: 0.6, icon: 'fa-volume-down' },
            { vol: 1.0, icon: 'fa-volume-up' }
        ];
        
        let currentVolIndex = 0; // Starts muted
        bgAudio.volume = volumeLevels[currentVolIndex].vol;
        bgAudio.muted = true;

        audioToggle.addEventListener('click', () => {
            currentVolIndex = (currentVolIndex + 1) % volumeLevels.length;
            const level = volumeLevels[currentVolIndex];
            
            bgAudio.volume = level.vol;
            
            if (level.vol === 0) {
                bgAudio.muted = true;
            } else {
                bgAudio.muted = false;
                if (bgAudio.paused) {
                    bgAudio.play().catch(e => console.log("Audio play failed:", e));
                }
            }
            
            audioToggle.innerHTML = `<i class="fas ${level.icon}"></i>`;
        });
    }

    // --- Contact Form AJAX Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent the default form redirect
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Sending...";
            
            const data = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    contactForm.reset();
                    formStatus.style.display = 'block';
                    formStatus.innerText = "Response Submitted! I will get back to you soon.";
                    formStatus.style.color = '#10b981'; // Green success color
                    
                    setTimeout(() => {
                        formStatus.style.display = 'none';
                    }, 5000);
                } else {
                    formStatus.style.display = 'block';
                    formStatus.innerText = "Oops! There was a problem submitting your form.";
                    formStatus.style.color = '#ef4444'; // Red error color
                }
            } catch (error) {
                formStatus.style.display = 'block';
                formStatus.innerText = "Oops! Could not connect to the server.";
                formStatus.style.color = '#ef4444';
            } finally {
                submitBtn.innerText = originalBtnText;
            }
        });
    }
});
