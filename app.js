/**
 * App State
 */
const state = {
    patterns: [],
    theme: 'dark',
    currentCategory: null,
    currentPattern: null,
    searchQuery: '',
    sidebarOpen: false
};

/**
 * DOM Elements
 */
const els = {
    sidebarNav: document.getElementById('sidebar-nav'),
    contentArea: document.getElementById('content-container'),
    searchInput: document.getElementById('search-input'),
    themeToggle: document.getElementById('theme-toggle'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileCloseBtn: document.getElementById('mobile-close'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    recallFab: document.getElementById('recall-fab'),
    recallModal: document.getElementById('recall-modal'),
    modalCloseBtn: document.getElementById('modal-close'),
    modalContent: document.getElementById('modal-content')
};

/**
 * Initialization
 */
function initApp() {
    state.patterns = window.DESIGN_PATTERNS || [];
    
    initTheme();
    initMermaid();
    setupEventListeners();
    
    renderSidebar();
    
    // Handle initial routing
    handleHashChange();
}

/**
 * Theme & External Libs
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        state.theme = savedTheme;
    } else {
        // Check OS preference
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        state.theme = prefersLight ? 'light' : 'dark';
    }
    applyTheme();
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme();
    
    // Re-init mermaid with new theme if a diagram is present
    initMermaid();
    if (state.currentPattern && state.currentPattern.diagram) {
        // Re-render pattern to update diagram colors
        renderPatternDetail(state.currentCategory, state.currentPattern);
    }
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    els.themeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';
    
    // Update highlight.js theme
    const hljsLink = document.getElementById('hljs-theme');
    const themeName = state.theme === 'dark' ? 'atom-one-dark' : 'atom-one-light';
    hljsLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`;
}

function initMermaid() {
    if (window.mermaid) {
        window.mermaid.initialize({
            startOnLoad: false,
            theme: state.theme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose'
        });
    }
}

let mermaidCounter = 0;

async function renderMermaidDiagram(diagramCode) {
    const container = document.getElementById('mermaid-diagram');
    if (!container || !window.mermaid) return;

    try {
        mermaidCounter++;
        const id = `mermaid-svg-${mermaidCounter}`;
        const { svg } = await window.mermaid.render(id, diagramCode);
        container.innerHTML = svg;
    } catch (err) {
        console.warn('Mermaid render error:', err);
        container.innerHTML = `<pre style="color: var(--text-secondary); font-family: var(--font-code); font-size: 0.85rem; text-align: left; white-space: pre-wrap;">${escapeHtml(diagramCode)}</pre>`;
    }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    els.themeToggle.addEventListener('click', toggleTheme);
    els.searchInput.addEventListener('input', (e) => filterPatterns(e.target.value));
    
    // Mobile Sidebar
    els.mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    els.mobileCloseBtn.addEventListener('click', toggleMobileSidebar);
    els.sidebarOverlay.addEventListener('click', toggleMobileSidebar);
    
    // Brand Home Navigation
    const brandHome = document.getElementById('brand-home');
    if (brandHome) {
        brandHome.addEventListener('click', () => {
            selectPattern(null, null);
        });
    }
    const mobileBrandHome = document.getElementById('mobile-brand-home');
    if (mobileBrandHome) {
        mobileBrandHome.addEventListener('click', () => {
            selectPattern(null, null);
        });
    }

    // Recall Modal
    els.recallFab.addEventListener('click', () => {
        if (state.currentPattern) openRecallModal(state.currentPattern);
    });
    els.modalCloseBtn.addEventListener('click', closeRecallModal);
    els.recallModal.addEventListener('click', (e) => {
        if (e.target === els.recallModal) closeRecallModal();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && els.recallModal.classList.contains('show')) {
            closeRecallModal();
        }
    });
    
    // Routing
    window.addEventListener('hashchange', handleHashChange);
}

/**
 * Routing
 */
function handleHashChange() {
    const hash = window.location.hash.slice(1); // remove '#'
    if (!hash) {
        selectPattern(null, null);
        return;
    }
    
    const [catId, patId] = hash.split('/');
    if (catId && patId) {
        selectPattern(catId, patId, false);
    }
}

/**
 * Routing
 */
function handleHashChange() {
    const hash = window.location.hash.slice(1); // remove '#'
    if (!hash) {
        selectPattern(null, null, false);
        return;
    }
    
    const parts = hash.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) {
        selectPattern(parts[0], parts[1], false);
    } else if (parts.length === 1 && parts[0]) {
        // Category view route #creational
        selectCategory(parts[0], false);
    }
}

function selectCategory(categoryId, updateHash = true) {
    const category = state.patterns.find(c => c.categoryId === categoryId);
    if (!category) return;

    state.currentCategory = category;
    state.currentPattern = null;

    renderCategoryOverview(category);
    updateSidebarActiveState();

    els.recallFab.style.display = 'none';

    if (updateHash) {
        window.location.hash = `${categoryId}`;
    }

    // Ensure category list in sidebar is expanded
    const catSection = document.getElementById(`cat-${categoryId}`);
    if (catSection && catSection.classList.contains('collapsed')) {
        toggleCategory(categoryId);
    }

    if (window.innerWidth <= 768 && state.sidebarOpen) {
        toggleMobileSidebar();
    }

    els.contentArea.scrollTop = 0;
}

function selectPattern(categoryId, patternId, updateHash = true) {
    if (!categoryId || !patternId) {
        state.currentCategory = null;
        state.currentPattern = null;
        renderWelcomeScreen();
        updateSidebarActiveState();
        els.recallFab.style.display = 'none';
        if (updateHash) window.location.hash = '';
        return;
    }

    const category = state.patterns.find(c => c.categoryId === categoryId);
    if (!category) return;
    
    const pattern = category.patterns.find(p => p.id === patternId);
    if (!pattern) return;

    state.currentCategory = category;
    state.currentPattern = pattern;
    
    renderPatternDetail(category, pattern);
    updateSidebarActiveState();
    
    els.recallFab.style.display = 'flex';
    
    if (updateHash) {
        window.location.hash = `${categoryId}/${patternId}`;
    }
    
    // Ensure category section is open
    const catSection = document.getElementById(`cat-${categoryId}`);
    if (catSection && catSection.classList.contains('collapsed')) {
        toggleCategory(categoryId);
    }

    // On mobile, close sidebar when selecting a pattern
    if (window.innerWidth <= 768 && state.sidebarOpen) {
        toggleMobileSidebar();
    }
    
    // Scroll to top
    els.contentArea.scrollTop = 0;
}

/**
 * Rendering
 */
function renderSidebar() {
    els.sidebarNav.innerHTML = '';
    
    state.patterns.forEach(category => {
        const catEl = document.createElement('div');
        catEl.className = 'category-section';
        catEl.id = `cat-${category.categoryId}`;
        
        // Category Header with separated category title link & collapse button
        const header = document.createElement('div');
        header.className = 'category-header';
        
        header.innerHTML = `
            <div class="category-border" style="background-color: ${category.categoryColor}"></div>
            <a href="#${category.categoryId}" class="category-title" data-cat="${category.categoryId}" title="View ${category.categoryName} category overview">
                <span>${category.categoryIcon}</span> ${category.categoryName}
            </a>
            <div class="category-badge">${category.patterns.length}</div>
            <button class="category-toggle-btn" aria-label="Toggle ${category.categoryName}" onclick="event.stopPropagation(); toggleCategory('${category.categoryId}');">
                <span class="category-toggle">▼</span>
            </button>
        `;
        
        // Pattern List
        const listEl = document.createElement('ul');
        listEl.className = 'pattern-list';
        listEl.id = `list-${category.categoryId}`;
        
        // Calculate height for transition (assuming ~42px per item)
        const contentHeight = category.patterns.length * 45;
        listEl.style.maxHeight = `${contentHeight}px`;
        
        category.patterns.forEach((pattern, idx) => {
            const itemEl = document.createElement('li');
            itemEl.innerHTML = `
                <a href="#${category.categoryId}/${pattern.id}" class="pattern-item" data-id="${pattern.id}" data-cat="${category.categoryId}">
                    <span class="pattern-rank">#${idx + 1}</span>
                    <span class="pattern-icon">${pattern.icon}</span>
                    <span class="pattern-name">${pattern.name}</span>
                </a>
            `;
            listEl.appendChild(itemEl);
        });
        
        catEl.appendChild(header);
        catEl.appendChild(listEl);
        els.sidebarNav.appendChild(catEl);
    });
}

function updateSidebarActiveState() {
    document.querySelectorAll('.pattern-item').forEach(item => {
        item.classList.remove('active');
        item.style.backgroundColor = '';
        item.style.borderLeftColor = 'transparent';
    });

    document.querySelectorAll('.category-header').forEach(header => {
        header.classList.remove('active-cat');
    });
    
    if (state.currentPattern && state.currentCategory) {
        const activeItem = document.querySelector(`.pattern-item[data-id="${state.currentPattern.id}"][data-cat="${state.currentCategory.categoryId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            
            const hex = state.currentCategory.categoryColor;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            
            activeItem.style.setProperty('--active-bg', `rgba(${r}, ${g}, ${b}, 0.15)`);
            activeItem.style.setProperty('--active-color', hex);
        }
    } else if (state.currentCategory && !state.currentPattern) {
        const catHeader = document.querySelector(`#cat-${state.currentCategory.categoryId} .category-header`);
        if (catHeader) {
            catHeader.classList.add('active-cat');
        }
    }
}

function renderWelcomeScreen() {
    let cardsHtml = '';
    
    state.patterns.forEach(cat => {
        cardsHtml += `
            <div class="category-card" onclick="location.hash='${cat.categoryId}';" style="border-top: 4px solid ${cat.categoryColor}">
                <div class="cat-card-header">
                    <div class="cat-card-icon">${cat.categoryIcon}</div>
                    <div>
                        <div class="cat-card-title">${cat.categoryName}</div>
                        <div class="cat-card-meta" style="color: ${cat.categoryColor}">${cat.patterns.length} Patterns (in order of priority)</div>
                    </div>
                </div>
                <div class="cat-card-desc">${cat.categoryDescription.substring(0, 140)}...</div>
                <div class="cat-card-action" style="color: ${cat.categoryColor}">
                    Explore category overview &amp; patterns →
                </div>
            </div>
        `;
    });

    els.contentArea.innerHTML = `
        <div class="welcome-screen">
            <div class="hero">
                <h1>Master Design Patterns</h1>
                <p>Interactive guide with Python &amp; Go examples, UML diagrams, interview recall cards, and category architecture breakdowns to level up your engineering skills.</p>
            </div>
            <div class="categories-grid">
                ${cardsHtml}
            </div>
            <div class="welcome-footer">
                <p>Select any category or pattern from the sidebar to begin</p>
            </div>
        </div>
    `;
}

function renderCategoryOverview(category) {
    const paragraphs = category.categoryDescription.split('\n\n').filter(p => p.trim());
    
    const catAspects = [
        { icon: '🎯', label: 'Primary Purpose & Philosophy', accent: category.categoryColor },
        { icon: '🧩', label: 'How Patterns in this Category Relate', accent: '#6366f1' },
        { icon: '🚀', label: 'When to Reach for this Category', accent: '#f59e0b' },
        { icon: '💡', label: 'Architecture Insight', accent: '#8b5cf6' }
    ];

    const breakdownHtml = paragraphs.map((text, i) => {
        const aspect = catAspects[Math.min(i, catAspects.length - 1)];
        const isLast = i === paragraphs.length - 1;
        const delay = i * 80;

        return `
            <div class="breakdown-step" style="animation-delay: ${delay}ms">
                <div class="breakdown-marker">
                    <div class="breakdown-icon" style="border-color: ${aspect.accent}; color: ${aspect.accent}">
                        ${aspect.icon}
                    </div>
                    ${!isLast ? `<div class="breakdown-line" style="background: linear-gradient(to bottom, ${aspect.accent}44, ${catAspects[Math.min(i+1, catAspects.length-1)].accent}44)"></div>` : ''}
                </div>
                <div class="breakdown-content">
                    <div class="breakdown-label" style="color: ${aspect.accent}">${aspect.label}</div>
                    <div class="breakdown-text">${text}</div>
                </div>
            </div>
        `;
    }).join('');

    const patternCardsHtml = category.patterns.map((p, idx) => `
        <a href="#${category.categoryId}/${p.id}" class="cat-pattern-card">
            <div class="cat-pattern-top">
                <span class="cat-pattern-icon">${p.icon}</span>
                <span class="cat-pattern-badge" style="background-color: ${category.categoryColor}22; color: ${category.categoryColor}">Priority #${idx + 1}</span>
            </div>
            <div class="cat-pattern-title">${p.name}</div>
            <div class="cat-pattern-intent">${p.intent}</div>
            <div class="cat-pattern-analogy"><strong>Analogy:</strong> ${p.recall.analogy}</div>
            <div class="cat-pattern-cta">Learn pattern details &amp; code →</div>
        </a>
    `).join('');

    els.contentArea.innerHTML = `
        <div class="category-overview-view">
            <div class="breadcrumb">
                <a href="#">Home</a>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">${category.categoryName}</span>
            </div>

            <div class="category-hero" style="border-left: 4px solid ${category.categoryColor}">
                <div class="category-hero-icon">${category.categoryIcon}</div>
                <div>
                    <h1 class="category-hero-title">${category.categoryName}</h1>
                    <div class="category-hero-subtitle">${category.patterns.length} Essential Patterns • Sorted by Architectural Importance</div>
                </div>
            </div>

            <div class="pattern-breakdown">
                <div class="breakdown-header">
                    <span>🏛️</span> Category Architecture Deep Dive
                </div>
                ${breakdownHtml}
            </div>

            <div class="category-patterns-section">
                <div class="section-title">
                    <span>📚</span> Patterns in this Category (Order of Importance)
                </div>
                <div class="category-patterns-grid">
                    ${patternCardsHtml}
                </div>
            </div>
        </div>
    `;
}

/**
 * Splits a description into paragraphs and renders them
 * as a visual vertical timeline with aspect labels.
 */
function buildDescriptionBreakdown(description, categoryColor) {
    const paragraphs = description.split('\n\n').filter(p => p.trim());

    // Aspect definitions based on paragraph position
    const aspects = [
        { icon: '💡', label: 'What It Is',        accent: categoryColor },
        { icon: '⚙️', label: 'How It Works',      accent: '#6366f1' },
        { icon: '💭', label: 'Keep In Mind',       accent: '#f59e0b' },
        { icon: '🔍', label: 'Deeper Insight',     accent: '#8b5cf6' },
        { icon: '📌', label: 'Additional Note',    accent: '#64748b' },
    ];

    const stepsHtml = paragraphs.map((text, i) => {
        const aspect = aspects[Math.min(i, aspects.length - 1)];
        const isLast = i === paragraphs.length - 1;
        const delay = i * 80;

        return `
            <div class="breakdown-step" style="animation-delay: ${delay}ms">
                <div class="breakdown-marker">
                    <div class="breakdown-icon" style="border-color: ${aspect.accent}; color: ${aspect.accent}">
                        ${aspect.icon}
                    </div>
                    ${!isLast ? `<div class="breakdown-line" style="background: linear-gradient(to bottom, ${aspect.accent}44, ${aspects[Math.min(i+1, aspects.length-1)].accent}44)"></div>` : ''}
                </div>
                <div class="breakdown-content">
                    <div class="breakdown-label" style="color: ${aspect.accent}">${aspect.label}</div>
                    <div class="breakdown-text">${text}</div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="pattern-breakdown">
            <div class="breakdown-header">
                <span>📖</span> Understanding the Pattern
            </div>
            ${stepsHtml}
        </div>
    `;
}

function renderPatternDetail(category, pattern) {
    const p = pattern;
    
    // Construct HTML for problem/solution
    const problemHtml = `
        <div class="card problem-card">
            <div class="section-title"><span>🔴</span> Problem</div>
            <p>${p.problem}</p>
        </div>
    `;
    
    const solutionHtml = `
        <div class="card solution-card">
            <div class="section-title"><span>🟢</span> Solution</div>
            <p>${p.solution}</p>
        </div>
    `;

    // Construct Applicability
    const applicabilityHtml = p.applicability.map(item => `<li>${item}</li>`).join('');
    
    // Construct Pros/Cons
    const prosHtml = p.pros.map(item => `<li>${item}</li>`).join('');
    const consHtml = p.cons.map(item => `<li>${item}</li>`).join('');

    // Find prev and next patterns in the same category
    const patternIdx = category.patterns.findIndex(item => item.id === p.id);
    const prevPattern = patternIdx > 0 ? category.patterns[patternIdx - 1] : null;
    const nextPattern = patternIdx < category.patterns.length - 1 ? category.patterns[patternIdx + 1] : null;

    const navPaginationHtml = `
        <div class="pattern-pagination">
            ${prevPattern ? `
                <a href="#${category.categoryId}/${prevPattern.id}" class="pagination-link pagination-prev">
                    <span class="pagination-sub">← Previous (#${patternIdx})</span>
                    <span class="pagination-title">${prevPattern.icon} ${prevPattern.name}</span>
                </a>
            ` : `<div class="pagination-spacer"></div>`}
            
            <a href="#${category.categoryId}" class="pagination-category-btn" title="View all ${category.categoryName}">
                <span>${category.categoryIcon}</span> Overview
            </a>

            ${nextPattern ? `
                <a href="#${category.categoryId}/${nextPattern.id}" class="pagination-link pagination-next">
                    <span class="pagination-sub">Next (#${patternIdx + 2}) →</span>
                    <span class="pagination-title">${nextPattern.icon} ${nextPattern.name}</span>
                </a>
            ` : `<div class="pagination-spacer"></div>`}
        </div>
    `;

    els.contentArea.innerHTML = `
        <div class="pattern-detail">
            <div class="breadcrumb">
                <a href="#">Home</a>
                <span class="breadcrumb-separator">/</span>
                <a href="#${category.categoryId}">${category.categoryName}</a>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">${p.name}</span>
            </div>

            <div class="pattern-header">
                <div class="pattern-header-top">
                    <div class="pattern-header-icon">${p.icon}</div>
                    <div>
                        <h1 class="pattern-title">${p.name}</h1>
                    </div>
                </div>
                <div class="pattern-badges-row">
                    <a href="#${category.categoryId}" class="pattern-badge" style="background-color: ${category.categoryColor}22; color: ${category.categoryColor}">
                        ${category.categoryIcon} ${category.categoryName}
                    </a>
                    <span class="pattern-rank-badge">Priority #${patternIdx + 1} of ${category.patterns.length}</span>
                </div>
                <div class="pattern-intent">${p.intent}</div>
            </div>

            <div class="card analogy-card">
                <div class="section-title"><span>💡</span> Real World Analogy</div>
                <p>${p.realWorldAnalogy}</p>
            </div>

            ${buildDescriptionBreakdown(p.description, category.categoryColor)}

            <div class="two-col">
                ${problemHtml}
                ${solutionHtml}
            </div>

            ${p.diagram ? `
            <div class="diagram-container">
                <div id="mermaid-diagram"></div>
            </div>
            ` : ''}

            <div class="card">
                <div class="section-title"><span>🎯</span> When to Use</div>
                <ul class="check-list">
                    ${applicabilityHtml}
                </ul>
            </div>

            <div class="code-section">
                <div class="code-tabs">
                    <button class="code-tab active" onclick="switchCodeTab('python')">Python 🐍</button>
                    <button class="code-tab" onclick="switchCodeTab('golang')">Go 🐹</button>
                </div>
                <div class="code-content" id="code-content">
                    <pre><code class="language-python">${escapeHtml(p.pythonCode)}</code></pre>
                </div>
            </div>

            <div class="two-col pros-cons">
                <div class="card pros-card">
                    <div class="section-title"><span>👍</span> Pros</div>
                    <ul class="check-list">
                        ${prosHtml}
                    </ul>
                </div>
                <div class="card cons-card">
                    <div class="section-title"><span>👎</span> Cons</div>
                    <ul class="cross-list">
                        ${consHtml}
                    </ul>
                </div>
            </div>

            ${navPaginationHtml}
        </div>
    `;

    // Initialize highlighting
    setTimeout(() => {
        if (window.hljs) hljs.highlightAll();
    }, 10);

    // Render mermaid diagram
    if (window.mermaid && p.diagram) {
        renderMermaidDiagram(p.diagram);
    }
}

// Global function for onclick in HTML
window.switchCodeTab = function(lang) {
    if (!state.currentPattern) return;
    
    // Update tabs
    const tabs = document.querySelectorAll('.code-tab');
    tabs[0].classList.toggle('active', lang === 'python');
    tabs[1].classList.toggle('active', lang === 'golang');
    
    // Update content
    const codeContent = document.getElementById('code-content');
    const codeStr = lang === 'python' ? state.currentPattern.pythonCode : state.currentPattern.golangCode;
    const codeClass = lang === 'python' ? 'language-python' : 'language-go';
    
    codeContent.innerHTML = `<pre><code class="${codeClass}">${escapeHtml(codeStr)}</code></pre>`;
    
    // Re-highlight
    if (window.hljs) {
        hljs.highlightElement(codeContent.querySelector('code'));
    }
}

/**
 * Recall Modal
 */
function openRecallModal(pattern) {
    const r = pattern.recall;
    
    const keyPointsHtml = r.keyPoints.map(p => `<li>${p}</li>`).join('');
    const whenToUseHtml = r.whenToUse.map(w => `<li>${w}</li>`).join('');

    els.modalContent.innerHTML = `
        <div class="recall-header">
            <div class="recall-icon">${r.emoji}</div>
            <div class="recall-title">${pattern.name}</div>
            <div class="recall-oneliner">${r.oneLiner}</div>
        </div>
        
        <div class="recall-section">
            <h4><span>💡</span> Analogy</h4>
            <p>${r.analogy}</p>
        </div>
        
        <div class="recall-section">
            <h4><span>🎯</span> Key Points</h4>
            <ul style="padding-left: 1.5rem; margin-bottom: 1rem;">
                ${keyPointsHtml}
            </ul>
        </div>
        
        <div class="recall-section">
            <h4><span>✅</span> When to Use</h4>
            <ul class="check-list">
                ${whenToUseHtml}
            </ul>
        </div>
        
        <div class="recall-section">
            <h4><span>🎤</span> Interview Tip</h4>
            <div class="recall-tip">${r.interviewTip}</div>
        </div>
        
        <div class="recall-section">
            <h4><span>💻</span> Code Hint</h4>
            <div class="recall-code">${escapeHtml(r.codeHint)}</div>
        </div>
    `;
    
    els.recallModal.classList.add('show');
}

function closeRecallModal() {
    els.recallModal.classList.remove('show');
}

/**
 * Interactions
 */
function toggleCategory(categoryId) {
    const section = document.getElementById(`cat-${categoryId}`);
    const list = document.getElementById(`list-${categoryId}`);
    
    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        list.style.maxHeight = `${list.scrollHeight}px`;
    } else {
        section.classList.add('collapsed');
        list.style.maxHeight = '0px';
    }
}

function toggleMobileSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    if (state.sidebarOpen) {
        els.sidebar.classList.add('open');
        els.sidebarOverlay.classList.add('open');
    } else {
        els.sidebar.classList.remove('open');
        els.sidebarOverlay.classList.remove('open');
    }
}

function filterPatterns(query) {
    query = query.toLowerCase();
    
    state.patterns.forEach(category => {
        let hasVisiblePattern = false;
        
        category.patterns.forEach(pattern => {
            const itemEl = document.querySelector(`.pattern-item[data-id="${pattern.id}"]`).parentElement;
            const match = pattern.name.toLowerCase().includes(query) || 
                          pattern.intent.toLowerCase().includes(query);
            
            itemEl.style.display = match ? 'block' : 'none';
            if (match) hasVisiblePattern = true;
        });
        
        const catEl = document.getElementById(`cat-${category.categoryId}`);
        catEl.style.display = (hasVisiblePattern || category.categoryName.toLowerCase().includes(query)) ? 'block' : 'none';
        
        // Expand category if searching
        if (query && hasVisiblePattern) {
            catEl.classList.remove('collapsed');
            const list = document.getElementById(`list-${category.categoryId}`);
            list.style.maxHeight = `${list.scrollHeight}px`;
        }
    });
}

/**
 * Utils
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Bootstrap
document.addEventListener('DOMContentLoaded', initApp);
