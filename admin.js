/* ==========================================================================
   SYSTEM CORE: CLOUD GATEWAY CONFIGURATION
   ========================================================================== */
const SUPABASE_URL = 'https://ikkoqfikqxgeqywvxart.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SLL5wX1jXQWDdc1bMpSehw_R3mDt2kC';

/* ==========================================================================
   ADMIN ENGINE ENTRYPOINT & SECURE AUTH
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    
    let supabaseClient = null;
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("ADMIN: Supabase portal engine mounted.");
    } catch (e) {
        console.error("ADMIN_ERR: Failed to initialize Supabase client:", e);
        return;
    }

    const loginState = document.getElementById('login-state');
    const dashboardState = document.getElementById('dashboard-state');
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const adminUserEmail = document.getElementById('admin-user-email');
    const signoutBtn = document.getElementById('signout-btn');

    // Monitor session state changes
    async function checkSessionState() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (user) {
            // Logged in: mount dashboard
            loginState.style.display = 'none';
            dashboardState.style.display = 'block';
            adminUserEmail.textContent = `AUTHORIZED // ${user.email.toUpperCase()}`;
            fetchAndRenderProjects();
        } else {
            // Not logged in: mount secure auth gate
            loginState.style.display = 'flex';
            dashboardState.style.display = 'none';
        }
    }

    // Initialize session state verify
    checkSessionState();

    // Login Submission Ingestion
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        loginError.style.display = 'none';

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            loginError.textContent = `ACCESS DENIED: ${error.message.toUpperCase()}`;
            loginError.style.display = 'block';
        } else {
            console.log("AUTH: Session key successfully generated.");
            loginForm.reset();
            checkSessionState();
        }
    });

    // Sign Out Dispatcher
    signoutBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error("AUTH_ERR: Failed to destroy session key:", error);
        } else {
            console.log("AUTH: Session key destroyed.");
            resetFormState();
            checkSessionState();
        }
    });

    /* ==========================================================================
       CRUD OPERATIONS: ACTIVE ENGINE MONITOR & TRANSMISSION
       ========================================================================== */
    const projectForm = document.getElementById('project-form');
    const formPanelTitle = document.getElementById('form-panel-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const projectListArea = document.getElementById('project-list-area');

    let currentEditingProject = null;

    // READ: Load active projects from cloud database
    async function fetchAndRenderProjects() {
        projectListArea.innerHTML = `
            <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 40px 0;">
                PINGING CLOUD SYSTEMS...
            </div>
        `;

        try {
            const { data, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('order_num', { ascending: true });

            if (error) throw error;

            projectListArea.innerHTML = '';

            if (!data || data.length === 0) {
                projectListArea.innerHTML = `
                    <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 40px 0;">
                        NO ACTIVE ENGINES DETECTED IN CLOUD DATABASE.
                    </div>
                `;
                return;
            }

            data.forEach(project => {
                const item = document.createElement('div');
                item.className = 'admin-project-item';
                
                item.innerHTML = `
                    <div class="admin-proj-info">
                        <span class="admin-proj-title">${project.title}</span>
                        <span class="admin-proj-meta">
                            [${project.category.toUpperCase()}] // YEAR ${project.year} // ORDER INDEX: ${project.order_num}
                        </span>
                    </div>
                    <div class="admin-proj-actions">
                        <button class="admin-action-btn edit-trigger">[✎] EDIT</button>
                        <button class="admin-action-btn admin-action-delete delete-trigger">[🗑️] DELETE</button>
                    </div>
                `;

                // Edit Button Click
                item.querySelector('.edit-trigger').addEventListener('click', () => {
                    populateFormForEdit(project);
                });

                // Delete Button Click
                item.querySelector('.delete-trigger').addEventListener('click', () => {
                    decommissionProject(project);
                });

                projectListArea.appendChild(item);
            });

        } catch (err) {
            console.error("ADMIN_CRUD_ERR: Failed to retrieve projects:", err);
            projectListArea.innerHTML = `
                <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent); text-align: center; padding: 40px 0; border: 1px dashed var(--accent);">
                    PING TIMEOUT: FAIL TO CONNECT TO DATABASE SCHEMA.
                </div>
            `;
        }
    }

    // Populate CRUD Form for update mapping
    function populateFormForEdit(project) {
        currentEditingProject = project;

        document.getElementById('project-id').value = project.id;
        document.getElementById('proj-title').value = project.title;
        document.getElementById('proj-category').value = project.category;
        document.getElementById('proj-year').value = project.year;
        document.getElementById('proj-image').value = project.image_url;
        document.getElementById('proj-order').value = project.order_num || 1;
        document.getElementById('proj-role').value = project.role || '';
        document.getElementById('proj-desc-text').value = project.desc_text || '';
        document.getElementById('proj-long-desc').value = project.long_desc || '';
        
        // Format tech tags into comma-separated text
        if (project.tech_stack) {
            document.getElementById('proj-tech').value = project.tech_stack.join(', ');
        } else {
            document.getElementById('proj-tech').value = '';
        }

        // Populate metrics (3 slots)
        if (project.metrics && project.metrics.length >= 3) {
            document.getElementById('metric-1-label').value = project.metrics[0].label || '';
            document.getElementById('metric-1-value').value = project.metrics[0].value || '';
            document.getElementById('metric-1-percent').value = project.metrics[0].percent || 0;

            document.getElementById('metric-2-label').value = project.metrics[1].label || '';
            document.getElementById('metric-2-value').value = project.metrics[1].value || '';
            document.getElementById('metric-2-percent').value = project.metrics[1].percent || 0;

            document.getElementById('metric-3-label').value = project.metrics[2].label || '';
            document.getElementById('metric-3-value').value = project.metrics[2].value || '';
            document.getElementById('metric-3-percent').value = project.metrics[2].percent || 0;
        }

        // Populate architecture diagram flow steps (4 stages)
        if (project.architecture && project.architecture.length >= 4) {
            document.getElementById('stage-1-name').value = project.architecture[0].name || '';
            document.getElementById('stage-1-icon').value = project.architecture[0].icon || '';

            document.getElementById('stage-2-name').value = project.architecture[1].name || '';
            document.getElementById('stage-2-icon').value = project.architecture[1].icon || '';

            document.getElementById('stage-3-name').value = project.architecture[2].name || '';
            document.getElementById('stage-3-icon').value = project.architecture[2].icon || '';

            document.getElementById('stage-4-name').value = project.architecture[3].name || '';
            document.getElementById('stage-4-icon').value = project.architecture[3].icon || '';
        }

        formPanelTitle.textContent = `UPDATE SYSTEM ENGINE // ${project.title}`;
        submitBtn.textContent = `UPDATE ENGINE SPECS`;
        cancelEditBtn.style.display = 'inline-block';
        
        // Scroll form smoothly into focus
        projectForm.scrollIntoView({ behavior: 'smooth' });
    }

    // DECOMMISSION (DELETE): Destroy project row
    async function decommissionProject(project) {
        if (confirm(`WARNING: ARE YOU SURE YOU WANT TO DECOMMISSION ENGINE: ${project.title}? THIS IS A PERMANENT SYSTEM PURGE.`)) {
            try {
                const { error } = await supabaseClient
                    .from('projects')
                    .delete()
                    .eq('id', project.id);

                if (error) throw error;

                console.log(`CRUD: Engine ${project.title} purged.`);
                fetchAndRenderProjects();
                
                if (currentEditingProject && currentEditingProject.id === project.id) {
                    resetFormState();
                }
            } catch (err) {
                console.error("ADMIN_CRUD_ERR: Failed to decommission project:", err);
                alert("DECOMMISSION FAILURE: " + err.message);
            }
        }
    }

    // Reset CRUD form inputs to clean states
    function resetFormState() {
        currentEditingProject = null;
        projectForm.reset();
        document.getElementById('project-id').value = '';
        
        // Load default values into metrics
        document.getElementById('metric-1-label').value = "Response Time";
        document.getElementById('metric-1-value').value = "8.4ms";
        document.getElementById('metric-1-percent').value = 90;

        document.getElementById('metric-2-label').value = "Throughput Capacity";
        document.getElementById('metric-2-value').value = "45,000 req/sec";
        document.getElementById('metric-2-percent').value = 85;

        document.getElementById('metric-3-label').value = "Automation Level";
        document.getElementById('metric-3-value').value = "Fully Self-Healing";
        document.getElementById('metric-3-percent').value = 100;

        // Load default values into architecture diagram stages
        document.getElementById('stage-1-name').value = "Client Request";
        document.getElementById('stage-1-icon').value = "🌐";

        document.getElementById('stage-2-name').value = "Go Gateway Router";
        document.getElementById('stage-2-icon').value = "⚙️";

        document.getElementById('stage-3-name').value = "Redis Cache & Limiter";
        document.getElementById('stage-3-icon').value = "⚡";

        document.getElementById('stage-4-name').value = "Microservice Node";
        document.getElementById('stage-4-icon').value = "📦";

        formPanelTitle.textContent = `MOUNT NEW SYSTEM ENGINE`;
        submitBtn.textContent = `MOUNT SYSTEM ENGINE`;
        cancelEditBtn.style.display = 'none';
    }

    cancelEditBtn.addEventListener('click', resetFormState);

    // CREATE / UPDATE: Submit transaction pipeline
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('project-id').value;
        const title = document.getElementById('proj-title').value.toUpperCase().trim();
        const category = document.getElementById('proj-category').value;
        const year = document.getElementById('proj-year').value.trim();
        const image_url = document.getElementById('proj-image').value.trim();
        const order_num = parseInt(document.getElementById('proj-order').value) || 1;
        const role = document.getElementById('proj-role').value.trim();
        const desc_text = document.getElementById('proj-desc-text').value.trim();
        const long_desc = document.getElementById('proj-long-desc').value.trim();

        // Convert stack text into tag array
        const tech_stack = document.getElementById('proj-tech').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t !== '');

        // Compile metrics payload structure
        const metrics = [
            {
                label: document.getElementById('metric-1-label').value.trim(),
                value: document.getElementById('metric-1-value').value.trim(),
                percent: parseInt(document.getElementById('metric-1-percent').value) || 0
            },
            {
                label: document.getElementById('metric-2-label').value.trim(),
                value: document.getElementById('metric-2-value').value.trim(),
                percent: parseInt(document.getElementById('metric-2-percent').value) || 0
            },
            {
                label: document.getElementById('metric-3-label').value.trim(),
                value: document.getElementById('metric-3-value').value.trim(),
                percent: parseInt(document.getElementById('metric-3-percent').value) || 0
            }
        ];

        // Compile system architecture payload structure
        const architecture = [
            {
                name: document.getElementById('stage-1-name').value.trim(),
                icon: document.getElementById('stage-1-icon').value.trim()
            },
            {
                name: document.getElementById('stage-2-name').value.trim(),
                icon: document.getElementById('stage-2-icon').value.trim()
            },
            {
                name: document.getElementById('stage-3-name').value.trim(),
                icon: document.getElementById('stage-3-icon').value.trim()
            },
            {
                name: document.getElementById('stage-4-name').value.trim(),
                icon: document.getElementById('stage-4-icon').value.trim()
            }
        ];

        const payload = {
            title,
            desc_text,
            category,
            year,
            image_url,
            role,
            long_desc,
            tech_stack,
            metrics,
            architecture,
            order_num
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = id ? `TRANSMITTING SPECS...` : `TRANSMITTING ENGINE DATA...`;

            let error;
            if (id) {
                // Update transaction
                const result = await supabaseClient
                    .from('projects')
                    .update(payload)
                    .eq('id', parseInt(id));
                error = result.error;
            } else {
                // Insert transaction
                const result = await supabaseClient
                    .from('projects')
                    .insert([payload]);
                error = result.error;
            }

            if (error) throw error;

            console.log(`CRUD: Transaction successful for ${title}.`);
            resetFormState();
            fetchAndRenderProjects();

        } catch (err) {
            console.error("ADMIN_CRUD_ERR: Database transaction failed:", err);
            alert("TRANSACTION FAILURE: " + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = id ? `UPDATE ENGINE SPECS` : `MOUNT SYSTEM ENGINE`;
        }
    });

});
