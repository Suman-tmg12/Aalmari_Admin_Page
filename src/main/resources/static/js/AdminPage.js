// Core State Store
let sellers = [
    {
        id: 101, user: "Sujita Shrestha", email: "sujita@himalayanhandicrafts.com", phone: "+977 9841234567",
        storeName: "Himalayan Craft Aalmari", regNo: "REG-8841-KTM", pan: "602349182",
        bankName: "Nabil Bank Ltd", bankAcc: "010293847501", category: "Handicrafts & Decor",
        status: "Pending", appliedDate: "2026-10-04",
        documents: {
            citizenship: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80",
            regCert: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            taxClearance: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80"
        }
    },
    {
        id: 102, user: "Rohan Pradhan", email: "rohan@pashminaelegance.np", phone: "+977 9801987654",
        storeName: "Pashmina Elegance", regNo: "REG-9912-LAL", pan: "301982741",
        bankName: "Global IME Bank", bankAcc: "089123412301", category: "Apparel & Fashion",
        status: "Pending", appliedDate: "2026-10-05",
        documents: {
            citizenship: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
            regCert: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            taxClearance: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80"
        }
    },
    {
        id: 103, user: "Anil Gurung", email: "anil@kathmandutech.com", phone: "+977 9811223344",
        storeName: "Kathmandu Tech Central", regNo: "REG-1102-KTM", pan: "109283746",
        bankName: "NIC Asia Bank", bankAcc: "001239841289", category: "Electronics & Gadgets",
        status: "Pending", appliedDate: "2026-10-06",
        documents: {
            citizenship: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
            regCert: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            taxClearance: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80"
        }
    },
    {
        id: 104, user: "Pooja Thapa", email: "pooja@ethnikaalmari.com", phone: "+977 9851009988",
        storeName: "Ethnik Studio Aalmari", regNo: "REG-4432-BKT", pan: "509182736",
        bankName: "Standard Chartered", bankAcc: "019283741234", category: "Apparel & Fashion",
        status: "Approved", appliedDate: "2026-09-20", documents: {}
    }
];

let heroSlides = [
    { id: 1, title: "Festive Ethnic Aalmari Collection", subtitle: "EXCLUSIVE HANDMADE SAREES & KURTIS", ctaText: "Explore Collection", ctaUrl: "aalmari.com/category/ethnic-wear", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80", priority: 1, active: true },
    { id: 2, title: "Pure Cashmere & Pashmina Shawls", subtitle: "FLAT 25% OFF FOR VERIFIED VENDORS", ctaText: "Shop Winter Warmth", ctaUrl: "aalmari.com/category/pashmina", imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80", priority: 2, active: true },
    { id: 3, title: "Authentic Handcrafted Jewelry", subtitle: "DIRECT FROM LOCAL ARTISANS", ctaText: "Discover Jewelry", ctaUrl: "aalmari.com/category/jewelry", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80", priority: 3, active: true }
];

let vendorProducts = [
    { id: 201, title: "Handwoven Pure Cashmere Pashmina", store: "Pashmina Elegance", category: "Apparel", price: 12500, stock: 15, status: "Approved", featured: true },
    { id: 202, title: "Traditional Hand-Carved Wooden Box", store: "Himalayan Craft Aalmari", category: "Handicrafts", price: 3400, stock: 8, status: "Pending", featured: false },
    { id: 203, title: "Wireless Noise Canceling Earbuds", store: "Kathmandu Tech Central", category: "Electronics", price: 4990, stock: 25, status: "Approved", featured: true }
];

let activeKycSellerId = null;
let activeKycDocKey = 'citizenship';
let currentKycFilter = 'Pending';
let mockSlideIndex = 0;

window.onload = function() {
    renderDashboardActivity();
    renderKycSellerTable();
    renderHeroSlidesCMS();
    renderProductsModerationTable();
    renderPayoutsTable();
    initMarketplaceCharts();

    // ---- FIX: wire up sidebar nav items to switchView() ----
    document.querySelectorAll('.nav-menu .nav-item a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // stop the plain #hash jump
            const view = this.getAttribute('data-view');
            if (view) {
                switchView(view);
            }
        });
    });
    // ----------------------------------------------------------

    const kycSearchInput = document.getElementById('seller-kyc-search');
    if (kycSearchInput) {
        kycSearchInput.addEventListener('input', renderKycSellerTable);
    }

    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.trim()) {
                switchView('seller-kyc');
                const kycSearch = document.getElementById('seller-kyc-search');
                if (kycSearch) kycSearch.value = val;
                renderKycSellerTable();
            }
        });
    }

    // ---- FIX: guard theme-toggle in case the button/icons aren't in the DOM ----
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const isDark = html.getAttribute('data-theme') === 'dark';
            const iconMoon = document.getElementById('icon-moon');
            const iconSun = document.getElementById('icon-sun');
            if (isDark) {
                html.removeAttribute('data-theme');
                if (iconMoon) iconMoon.style.display = 'inline';
                if (iconSun) iconSun.style.display = 'none';
            } else {
                html.setAttribute('data-theme', 'dark');
                if (iconMoon) iconMoon.style.display = 'none';
                if (iconSun) iconSun.style.display = 'inline';
            }
        });
    }
    // ------------------------------------------------------------------------------

    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('mobile-open');
        });
    }
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('mobile-open');
        });
    }

    // Show mobile toggles only on small screens
    function syncMobileButtons() {
        const show = window.innerWidth <= 1024;
        if (openSidebarBtn) openSidebarBtn.style.display = show ? 'flex' : 'none';
        if (closeSidebarBtn) closeSidebarBtn.style.display = show ? 'flex' : 'none';
    }
    syncMobileButtons();
    window.addEventListener('resize', syncMobileButtons);
};

function switchView(viewName) {
    const views = ['dashboard', 'seller-kyc', 'homepage-cms', 'product-moderation', 'payouts', 'settings'];
    views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) el.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(li => {
        const link = li.querySelector('a');
        if (link && link.getAttribute('data-view') === viewName) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
}

function filterSellerStatus(status) {
    currentKycFilter = status;
    ['pending', 'approved', 'rejected', 'all'].forEach(tab => {
        const btn = document.getElementById(`tab-kyc-${tab}`);
        if (btn) {
            const isMatch = tab.toUpperCase() === status.toUpperCase() || (status === 'ALL' && tab === 'all');
            btn.classList.toggle('active', isMatch);
        }
    });
    renderKycSellerTable();
}

function renderKycSellerTable() {
    const tbody = document.getElementById('sellers-kyc-tbody');
    const searchInput = document.getElementById('seller-kyc-search');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    const pendingCount = sellers.filter(s => s.status === 'Pending').length;
    const approvedCount = sellers.filter(s => s.status === 'Approved').length;
    const rejectedCount = sellers.filter(s => s.status === 'Rejected').length;

    const navBadge = document.getElementById('nav-pending-kyc-badge');
    if (navBadge) navBadge.innerText = pendingCount;
    const dashCount = document.getElementById('dash-kyc-count');
    if (dashCount) dashCount.innerText = pendingCount;
    const statPending = document.getElementById('stat-pending-kyc');
    if (statPending) statPending.innerText = pendingCount;
    const statApproved = document.getElementById('stat-approved-sellers');
    if (statApproved) statApproved.innerText = approvedCount;

    const countPendingTab = document.getElementById('count-pending-tab');
    if (countPendingTab) countPendingTab.innerText = pendingCount;
    const countApprovedTab = document.getElementById('count-approved-tab');
    if (countApprovedTab) countApprovedTab.innerText = approvedCount;
    const countRejectedTab = document.getElementById('count-rejected-tab');
    if (countRejectedTab) countRejectedTab.innerText = rejectedCount;

    if (!tbody) return;

    const filtered = sellers.filter(s => {
        const matchStatus = currentKycFilter === 'ALL' || s.status === currentKycFilter;
        const matchSearch = s.storeName.toLowerCase().includes(search) || s.user.toLowerCase().includes(search) || s.pan.toLowerCase().includes(search);
        return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No seller applications matching this criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        let statusBadge = '';
        if (s.status === 'Pending') {
            statusBadge = `<span class="badge badge-pending">Pending KYC Review</span>`;
        } else if (s.status === 'Approved') {
            statusBadge = `<span class="badge badge-approved">Active Verified Seller</span>`;
        } else {
            statusBadge = `<span class="badge badge-rejected">Application Rejected</span>`;
        }

        return `
                    <tr>
                        <td>
                            <p class="cell-strong">${s.storeName}</p>
                            <p class="cell-muted">${s.email}</p>
                        </td>
                        <td>${s.user}</td>
                        <td class="mono">${s.pan}</td>
                        <td>${s.category}</td>
                        <td class="cell-muted">${s.appliedDate}</td>
                        <td>${statusBadge}</td>
                        <td class="text-right">
                            <button onclick="openKycModal(${s.id})" class="btn btn-primary btn-sm">
                                <i class="fa-solid fa-file-magnifying-glass"></i> ${s.status === 'Pending' ? 'Inspect Credentials' : 'View KYC Profile'}
                            </button>
                        </td>
                    </tr>
                `;
    }).join('');
}

function openKycModal(id) {
    const seller = sellers.find(s => s.id === id);
    if (!seller) return;

    activeKycSellerId = id;
    document.getElementById('kyc-modal-store-name').innerText = seller.storeName;
    document.getElementById('kyc-modal-applicant').innerText = `Applicant: ${seller.user} • Applied: ${sDate(seller.appliedDate)}`;

    document.getElementById('kyc-info-store').innerText = seller.storeName;
    document.getElementById('kyc-info-category').innerText = seller.category;
    document.getElementById('kyc-info-pan').innerText = seller.pan;
    document.getElementById('kyc-info-regno').innerText = seller.regNo;

    document.getElementById('kyc-info-user').innerText = seller.user;
    document.getElementById('kyc-info-phone').innerText = seller.phone;
    document.getElementById('kyc-info-bank').innerText = seller.bankName;
    document.getElementById('kyc-info-acc').innerText = seller.bankAcc;

    switchKycDocTab('citizenship');
    document.getElementById('modal-seller-kyc').classList.add('active');
}

function closeKycModal() {
    document.getElementById('modal-seller-kyc').classList.remove('active');
}

function switchKycDocTab(key) {
    activeKycDocKey = key;
    const seller = sellers.find(s => s.id === activeKycSellerId);
    const docUrl = seller && seller.documents ? seller.documents[key] : 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80';

    ['citizenship', 'regCert', 'taxClearance'].forEach(k => {
        const tabBtn = document.getElementById(`doc-tab-${k}`);
        if (tabBtn) tabBtn.classList.toggle('active', k === key);
    });

    document.getElementById('kyc-doc-img-preview').src = docUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80';
}

function openDocLightbox() {
    const imgUrl = document.getElementById('kyc-doc-img-preview').src;
    document.getElementById('lightbox-img').src = imgUrl;
    document.getElementById('modal-lightbox').style.display = 'flex';
}

function closeDocLightbox() {
    document.getElementById('modal-lightbox').style.display = 'none';
}

function approveSellerKyc() {
    if (!activeKycSellerId) return;
    const seller = sellers.find(s => s.id === activeKycSellerId);
    if (seller) {
        seller.status = 'Approved';
        showToast(`Seller "${seller.storeName}" approved! Account upgraded to Active Seller.`, 'success');
        renderKycSellerTable();
        renderDashboardActivity();
        closeKycModal();
    }
}

function openRejectReasonModal() {
    document.getElementById('modal-reject-reason').classList.add('active');
}

function closeRejectReasonModal() {
    document.getElementById('modal-reject-reason').classList.remove('active');
}

function applyPresetReason(val) {
    if (val) {
        document.getElementById('reject-custom-note').value = val;
    }
}

function submitKycRejection(e) {
    e.preventDefault();
    if (!activeKycSellerId) return;

    const note = document.getElementById('reject-custom-note').value;
    const seller = sellers.find(s => s.id === activeKycSellerId);

    if (seller) {
        seller.status = 'Rejected';
        seller.rejectionReason = note;
        showToast(`Seller application for "${seller.storeName}" was rejected. Notice sent.`, 'danger');
        renderKycSellerTable();
        renderDashboardActivity();
        closeRejectReasonModal();
        closeKycModal();
    }
}

// CMS & Hero Banner Engine
function renderHeroSlidesCMS() {
    const container = document.getElementById('hero-slides-list');
    if (!container) return;
    const badge = document.getElementById('slide-count-badge');
    if (badge) badge.innerText = `${heroSlides.filter(s => s.active).length} Slides Active`;

    container.innerHTML = heroSlides.map((slide) => `
                <div class="slide-item-card">
                    <img src="${slide.imageUrl}" alt="${slide.title}">
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <span class="slide-priority-badge">#${slide.priority}</span>
                            <h4 style="font-size:0.8rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${slide.title}</h4>
                        </div>
                        <p class="slide-meta">${slide.subtitle || 'No Subtitle'} • Route: ${slide.ctaUrl}</p>
                    </div>
                    <div class="slide-actions">
                        <button onclick="toggleSlideActive(${slide.id})" class="icon-action-btn ${slide.active ? 'on' : ''}" title="Toggle Banner Visibility">
                            <i class="fa-solid ${slide.active ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </button>
                        <button onclick="editSlide(${slide.id})" class="icon-action-btn"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deleteSlide(${slide.id})" class="icon-action-btn"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `).join('');

    updateMockHeroPreview();
}

function updateMockHeroPreview() {
    const activeSlides = heroSlides.filter(s => s.active);
    if (activeSlides.length === 0) return;

    if (mockSlideIndex >= activeSlides.length) mockSlideIndex = 0;
    const slide = activeSlides[mockSlideIndex];

    const img = document.getElementById('mock-slide-img');
    const title = document.getElementById('mock-slide-title');
    const subtitle = document.getElementById('mock-slide-subtitle');
    const btn = document.getElementById('mock-slide-btn');
    const route = document.getElementById('mock-slide-route');
    if (img) img.src = slide.imageUrl;
    if (title) title.innerText = slide.title;
    if (subtitle) subtitle.innerText = slide.subtitle || "AALMARI FEATURED";
    if (btn) btn.innerText = slide.ctaText || "Shop Now";
    if (route) route.innerText = slide.ctaUrl || "aalmari.com";

    const dotsContainer = document.getElementById('mock-slider-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = activeSlides.map((_, i) => `
                <span class="mock-dot ${i === mockSlideIndex ? 'active' : ''}"></span>
            `).join('');
    }
}

function nextMockSlide() {
    const activeSlides = heroSlides.filter(s => s.active);
    if (activeSlides.length === 0) return;
    mockSlideIndex = (mockSlideIndex + 1) % activeSlides.length;
    updateMockHeroPreview();
}

function prevMockSlide() {
    const activeSlides = heroSlides.filter(s => s.active);
    if (activeSlides.length === 0) return;
    mockSlideIndex = (mockSlideIndex - 1 + activeSlides.length) % activeSlides.length;
    updateMockHeroPreview();
}

function openAddSlideModal() {
    document.getElementById('modal-slide-header').innerText = "Add Homepage Hero Slide";
    document.getElementById('slide-form').reset();
    document.getElementById('slide-id').value = "";
    document.getElementById('modal-hero-slide').classList.add('active');
}

function editSlide(id) {
    const s = heroSlides.find(item => item.id === id);
    if (!s) return;

    document.getElementById('modal-slide-header').innerText = "Edit Homepage Hero Banner";
    document.getElementById('slide-id').value = s.id;
    document.getElementById('slide-title').value = s.title;
    document.getElementById('slide-subtitle').value = s.subtitle;
    document.getElementById('slide-cta').value = s.ctaText;
    document.getElementById('slide-route').value = s.ctaUrl;
    document.getElementById('slide-image').value = s.imageUrl;
    document.getElementById('slide-priority').value = s.priority;
    document.getElementById('slide-active').value = s.active.toString();

    document.getElementById('modal-hero-slide').classList.add('active');
}

function closeSlideModal() {
    document.getElementById('modal-hero-slide').classList.remove('active');
}

function handleSlideSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('slide-id').value;
    const title = document.getElementById('slide-title').value;
    const subtitle = document.getElementById('slide-subtitle').value;
    const ctaText = document.getElementById('slide-cta').value;
    const ctaUrl = document.getElementById('slide-route').value;
    const imageUrl = document.getElementById('slide-image').value;
    const priority = parseInt(document.getElementById('slide-priority').value);
    const active = document.getElementById('slide-active').value === 'true';

    if (id) {
        const idx = heroSlides.findIndex(s => s.id == id);
        if (idx !== -1) {
            heroSlides[idx] = { id: parseInt(id), title, subtitle, ctaText, ctaUrl, imageUrl, priority, active };
            showToast('Hero banner updated successfully', 'success');
        }
    } else {
        heroSlides.push({ id: Date.now(), title, subtitle, ctaText, ctaUrl, imageUrl, priority, active });
        showToast('New slide added to storefront banner carousel', 'success');
    }

    closeSlideModal();
    renderHeroSlidesCMS();
}

function toggleSlideActive(id) {
    const slide = heroSlides.find(s => s.id === id);
    if (slide) {
        slide.active = !slide.active;
        showToast(`Slide visibility set to ${slide.active ? 'Active' : 'Draft'}`, 'info');
        renderHeroSlidesCMS();
    }
}

function deleteSlide(id) {
    heroSlides = heroSlides.filter(s => s.id !== id);
    showToast('Hero slide banner deleted', 'danger');
    renderHeroSlidesCMS();
}

/* Product Moderation & Payout Logic */
function renderProductsModerationTable() {
    const tbody = document.getElementById('products-moderation-tbody');
    const sidebarCount = document.getElementById('sidebar-product-count');
    if (sidebarCount) sidebarCount.innerText = vendorProducts.length;

    if (!tbody) return;

    tbody.innerHTML = vendorProducts.map(p => `
                <tr>
                    <td class="cell-strong">${p.title}</td>
                    <td>${p.store}</td>
                    <td class="cell-muted">${p.category}</td>
                    <td class="cell-strong">NPR ${p.price.toLocaleString()}</td>
                    <td>${p.stock} units</td>
                    <td>
                        <span class="badge ${p.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${p.status}</span>
                    </td>
                    <td class="text-right">
                        <button onclick="toggleProductFeatured(${p.id})" class="feature-toggle ${p.featured ? 'active' : ''}">
                            ${p.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                    </td>
                </tr>
            `).join('');
}

function toggleProductFeatured(id) {
    const p = vendorProducts.find(item => item.id === id);
    if (p) {
        p.featured = !p.featured;
        showToast(`Product featured status updated`, 'info');
        renderProductsModerationTable();
    }
}

function renderPayoutsTable() {
    const tbody = document.getElementById('payouts-tbody');
    if (!tbody) return;
    const data = [
        { store: "Pashmina Elegance", sales: 85000, fee: 8500, net: 76500 },
        { store: "Himalayan Craft Aalmari", sales: 42000, fee: 4200, net: 37800 },
        { store: "Kathmandu Tech Central", sales: 57500, fee: 5750, net: 51750 }
    ];

    tbody.innerHTML = data.map(d => `
                <tr>
                    <td class="cell-strong">${d.store}</td>
                    <td class="mono">NPR ${d.sales.toLocaleString()}</td>
                    <td class="mono" style="color:var(--success); font-weight:700;">NPR ${d.fee.toLocaleString()}</td>
                    <td class="mono cell-strong">NPR ${d.net.toLocaleString()}</td>
                    <td class="text-right">
                        <button onclick="showToast('Payout settled for ${d.store}', 'success')" class="btn btn-primary btn-sm">Release Settlement</button>
                    </td>
                </tr>
            `).join('');
}

function updateCommissionRate() {
    const val = document.getElementById('default-commission-rate').value;
    showToast(`Default platform commission set to ${val}%`, 'success');
}

function renderDashboardActivity() {
    const container = document.getElementById('dashboard-activity-list');
    if (!container) return;
    const pendingList = sellers.filter(s => s.status === 'Pending');

    if (pendingList.length === 0) {
        container.innerHTML = `<p class="empty-note">All pending seller verification requests handled.</p>`;
        return;
    }

    container.innerHTML = pendingList.map(s => `
                <div class="activity-item">
                    <div class="activity-left">
                        <div class="activity-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
                        <div>
                            <p class="activity-title">${s.storeName} applied to become Seller</p>
                            <p class="activity-sub">Applicant: ${s.user} • Category: ${s.category}</p>
                        </div>
                    </div>
                    <a href="javascript:void(0)" onclick="switchView('seller-kyc'); openKycModal(${s.id});" class="activity-link">
                        Review KYC Documents <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `).join('');
}

function initMarketplaceCharts() {
    const canvas1 = document.getElementById('marketplaceChart');
    const canvas2 = document.getElementById('categoryChart');
    if (!canvas1 || !canvas2) return;

    const ctx1 = canvas1.getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [
                { label: 'GMV Gross Volume (NPR)', data: [85000, 110000, 135000, 150000, 168000, 184500], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.3 },
                { label: 'Aalmari Fee (10%)', data: [8500, 11000, 13500, 15000, 16800, 18450], borderColor: '#10b981', backgroundColor: 'transparent', tension: 0.3 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } } }
    });

    const ctx2 = canvas2.getContext('2d');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Apparel', 'Handicrafts', 'Electronics', 'Jewelry'],
            datasets: [{ data: [45, 25, 20, 10], backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    let icon = 'fa-circle-check';
    let cls = 'toast-success';
    if (type === 'danger') { icon = 'fa-circle-xmark'; cls = 'toast-danger'; }
    if (type === 'info') { icon = 'fa-circle-info'; cls = 'toast-info'; }

    toast.className = `toast ${cls}`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function sDate(dStr) {
    return dStr || 'Oct 2026';
}