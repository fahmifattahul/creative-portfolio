/* ==========================================================================
   SYSTEM CORE: CLOUD GATEWAY CONFIGURATION
   ========================================================================== */
const SUPABASE_URL = 'https://ikkoqfikqxgeqywvxart.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SLL5wX1jXQWDdc1bMpSehw_R3mDt2kC';

/* ==========================================================================
   LOCAL FALLBACK ENGINE METADATA
   ========================================================================== */
const fallbackProjects = [
    {
        id: 1,
        title: "NEXUS GATEWAY",
        desc_text: "A high-performance containerized API gateway and microservice orchestrator with auto-scaling metrics.",
        category: "services",
        year: "2026",
        image_url: "assets/project1.png",
        role: "Lead Systems Architect",
        tech_stack: ["Go", "gRPC", "Docker", "Redis", "Prometheus", "Kubernetes"],
        long_desc: "Nexus Gateway was built to solve container routing overhead in high-throughput clusters. By leveraging Go's raw concurrency, custom gRPC middleware, and Redis-based rate limiting, we eliminated traditional reverse-proxy latency spikes. The engine dynamically scales based on real-time Prometheus throughput queries, handling millions of daily handshakes in silence.",
        metrics: [
            { label: "Response Time", value: "8.4ms (99th percentile)", percent: 94 },
            { label: "Throughput Capacity", value: "45,000 req/sec", percent: 88 },
            { label: "CPU Utilization", value: "12% Peak Load", percent: 15 },
            { label: "Automation Level", value: "Fully Self-Healing", percent: 100 }
        ],
        architecture: [
            { name: "Client Request", icon: "🌐" },
            { name: "Go Gateway Router", icon: "⚙️" },
            { name: "Redis Cache & Limiter", icon: "⚡" },
            { name: "Microservice Node", icon: "📦" }
        ]
    },
    {
        id: 2,
        title: "PULSE BASH",
        desc_text: "Headless automation suite for real-time log ingestion, anomaly analysis, and instant developer alerts.",
        category: "automation",
        year: "2026",
        image_url: "assets/project2.png",
        role: "Pipeline & Otomasi Architect",
        tech_stack: ["Python", "ClickHouse", "Elasticsearch", "FastAPI", "Logstash", "Bash"],
        long_desc: "Pulse Bash is an automated, headless pipeline designed to ingest and parse millions of syslog strings per second. By routing logs directly into a ClickHouse column-store database, it performs real-time anomaly detection using vector calculations. When an anomaly is discovered, a highly-optimized Go daemon alerts developers within milliseconds, ensuring self-healing mechanisms kick in immediately.",
        metrics: [
            { label: "Ingestion Velocity", value: "1.2 GB/sec", percent: 90 },
            { label: "Anomaly Alert Latency", value: "<150ms", percent: 98 },
            { label: "Database Compression", value: "4.8x Columnar", percent: 82 },
            { label: "Uptime Rate", value: "99.999% Service SLA", percent: 100 }
        ],
        architecture: [
            { name: "Syslog Stream", icon: "🪵" },
            { name: "Pulse Ingest (FastAPI)", icon: "🔄" },
            { name: "ClickHouse DB", icon: "🗄️" },
            { name: "Alerts (Discord/Slack)", icon: "🔔" }
        ]
    },
    {
        id: 3,
        title: "CHRONOS LIBRARY",
        desc_text: "A lightweight, zero-dependency task scheduling module designed for low-latency asynchronous cron tasks.",
        category: "modules",
        year: "2025",
        image_url: "assets/project3.png",
        role: "Core Systems Developer",
        tech_stack: ["TypeScript", "Node.js", "Redis", "Cron", "Jest", "npm"],
        long_desc: "Chronos is a zero-dependency task scheduling library engineered for high-density callback dispatching. Built primarily in TypeScript, it replaces default setInterval drift with a high-resolution delta tick loop that aligns with standard system time. Integrated Redis cluster sync locks ensure that cron-scheduled background tasks are executed exactly once across distributed server farms, preventing race conditions.",
        metrics: [
            { label: "Scheduler Drift", value: "±1.2ms Variance", percent: 96 },
            { label: "Max Active Tasks", value: "100,000+ Concurrent", percent: 85 },
            { label: "Memory Footprint", value: "12MB Flat Idle", percent: 8 },
            { label: "Package Size", value: "4.2KB Zero-dep", percent: 98 }
        ],
        architecture: [
            { name: "Cron Trigger", icon: "⏰" },
            { name: "Queue Manager", icon: "⛓️" },
            { name: "Worker Pool", icon: "🛠️" },
            { name: "Callback Handler", icon: "🎯" }
        ]
    }
];

/* ==========================================================================
   DOM ENTRYPOINT & CONTROLLERS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    let supabaseClient = null;
    let isSupabaseConfigured = false;

    // Initialize Supabase if credentials are valid
    if (
        SUPABASE_URL && 
        SUPABASE_ANON_KEY && 
        !SUPABASE_URL.includes('ISI_URL') &&
        SUPABASE_URL.trim() !== ''
    ) {
        try {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            isSupabaseConfigured = true;
            console.log("SYSTEM: Supabase engine mounted successfully.");
        } catch (error) {
            console.error("SYSTEM_ERR: Failed to mount Supabase engine:", error);
        }
    } else {
        console.log("SYSTEM: Running in fallback mode.");
    }

    // Dynamic database loader
    async function loadProjects() {
        let projects = fallbackProjects;

        if (isSupabaseConfigured && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('projects')
                    .select('*')
                    .order('order_num', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    projects = data;
                    console.log(`SYSTEM: Dynamically pulled ${data.length} projects from cloud database.`);
                }
            } catch (err) {
                console.error("SYSTEM_ERR: Database query failed, using local recovery metrics:", err);
            }
        }

        renderGallery(projects);
        initializeScrollReveal();
    }

    // Render nodes to DOM
    function renderGallery(projects) {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.setAttribute('data-category', project.category);

            const description = project.desc_text || project.desc || '';

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${project.image_url}" alt="${project.title}" class="project-img">
                </div>
                <div class="card-details">
                    <div class="card-meta">
                        <span class="project-num">${String(project.id).padStart(2, '0')} / ${project.category.toUpperCase()}</span>
                        <span class="project-year">${project.year}</span>
                    </div>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${description}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                openProjectModal(project);
            });

            galleryGrid.appendChild(card);
        });

        const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allFilterBtn) {
            allFilterBtn.textContent = `ALL [${projects.length}]`;
        }

        initializeFilters();
    }

    loadProjects();

    // Intersection Observer for scroll triggers
    function initializeScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        const revealCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        };

        const revealObserver = new IntersectionObserver(revealCallback, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // Category sorting dispatcher
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                newButton.classList.add('active');

                const filterValue = newButton.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'flex';
                        void card.offsetWidth;
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 400);
                    }
                });
            });
        });
    }

    // Contact form ingestion pipeline
    const contactForm = document.getElementById('portfolio-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = `SENDING...`;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            setTimeout(() => {
                formFeedback.innerHTML = `MESSAGE RECEIVED. WE WILL CONNECT SHORTLY.`;
                formFeedback.className = 'form-feedback success';
                
                contactForm.reset();
                
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';

                setTimeout(() => {
                    formFeedback.style.opacity = '0';
                    setTimeout(() => {
                        formFeedback.innerHTML = '';
                        formFeedback.style.opacity = '1';
                    }, 300);
                }, 5000);

            }, 1500);
        });
    }

    // Interactive magnetic logo trigger
    const brandLogo = document.getElementById('brand-logo');
    if (brandLogo) {
        brandLogo.addEventListener('mouseenter', () => {
            brandLogo.style.transform = 'skewX(-4deg)';
        });
        brandLogo.addEventListener('mouseleave', () => {
            brandLogo.style.transform = 'none';
        });
    }

    // Interactive brutalist overlay modal controllers
    const defaultTechStack = ["Docker", "Linux", "REST API", "SQL", "Git"];
    const defaultMetrics = [
        { label: "Execution Time", value: "50ms", percent: 80 },
        { label: "Resource Usage", value: "Low", percent: 20 },
        { label: "Reliability Rate", value: "99.9%", percent: 99 }
    ];
    const defaultArchitecture = [
        { name: "Input Source", icon: "📥" },
        { name: "Core Processor", icon: "⚙️" },
        { name: "Data Storage", icon: "💾" },
        { name: "Output Service", icon: "📤" }
    ];
    const defaultLongDesc = "No detailed description available for this cloud database entry. This project remains fully containerized and active.";
    const defaultRole = "Systems Engineer";

    const modal = document.getElementById('project-modal');
    const contentArea = document.getElementById('modal-content-area');
    const closeBtn = document.getElementById('modal-close-btn');

    function openProjectModal(project) {
        if (!modal || !contentArea) return;

        const techStack = project.tech_stack || defaultTechStack;
        const metrics = project.metrics || defaultMetrics;
        const architecture = project.architecture || defaultArchitecture;
        const longDesc = project.long_desc || project.desc_text || project.desc || defaultLongDesc;
        const role = project.role || defaultRole;
        const category = project.category || "services";
        const year = project.year || "2026";
        const title = project.title || "PROJECT DETAIL";

        contentArea.innerHTML = `
            <div class="modal-header">
                <span class="modal-meta">${category.toUpperCase()} // ${year}</span>
                <h2 class="modal-project-title">${title}</h2>
                <div class="modal-role">// ROLE: ${role.toUpperCase()}</div>
            </div>
            
            <div class="modal-body-grid">
                <div class="modal-left-col">
                    <div class="modal-section-title">SYSTEM OVERVIEW</div>
                    <p class="modal-long-desc">${longDesc}</p>
                    
                    <div class="modal-section-title">STACK & DEPENDENCIES</div>
                    <div class="tech-tags-container">
                        ${techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    
                    <div class="modal-section-title">ENGINE METRICS</div>
                    <div class="metrics-container">
                        ${metrics.map(metric => `
                            <div class="metric-item">
                                <div class="metric-info">
                                    <span class="metric-label">${metric.label}</span>
                                    <span class="metric-value">${metric.value}</span>
                                </div>
                                <div class="metric-bar-bg">
                                    <div class="metric-bar-fill" style="width: 0%" data-percent="${metric.percent}"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="modal-right-col">
                    <div class="modal-section-title">SYSTEM ARCHITECTURE FLOW</div>
                    <div class="architecture-flow">
                        ${architecture.map((arch, index) => `
                            <div class="flow-node">
                                <div class="node-icon">${arch.icon}</div>
                                <div class="node-details">
                                    <span class="node-step">STAGE 0${index + 1}</span>
                                    <h4 class="node-name">${arch.name}</h4>
                                </div>
                            </div>
                            ${index < architecture.length - 1 ? `
                                <div class="flow-connector-vertical">
                                    <div class="connector-line">
                                        <div class="data-pulse"></div>
                                    </div>
                                </div>
                            ` : ''}
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const fills = modal.querySelectorAll('.metric-bar-fill');
            fills.forEach(fill => {
                const pct = fill.getAttribute('data-percent');
                fill.style.width = `${pct}%`;
            });
        }, 100);
    }

    function closeProjectModal() {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('active');
        document.body.style.overflow = '';

        const fills = modal.querySelectorAll('.metric-bar-fill');
        fills.forEach(fill => {
            fill.style.width = '0%';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
});
