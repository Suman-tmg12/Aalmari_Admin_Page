// Global variable to store fetched sellers data
let sellers = [];
let heroSlides = []; // Start empty, will fetch from backend

let vendorProducts = [];
let productModerationState = 'loading';
let productModerationError = '';
const PRODUCT_MODERATION_PAGE_SIZE = 25;
let productModerationPage = {
    page: 0,
    totalPages: 0,
    totalElements: 0,
    pendingCount: 0
};

let activeKycSellerId = null;
let activeKycDocKey = 'citizenship';
let currentKycFilter = 'Pending';
let mockSlideIndex = 0;
const SHOPPING_API_BASE_URL = document.querySelector('meta[name="aalmari-shopping-api-base"]')?.content.replace(/\/+$/, '') || '';

function adminFetch(resource, options = {}) {
    const requestOptions = { ...options };
    const method = (requestOptions.method || 'GET').toUpperCase();

    if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
        if (csrfToken && csrfHeader) {
            const headers = new Headers(requestOptions.headers || {});
            headers.set(csrfHeader, csrfToken);
            requestOptions.headers = headers;
        }
    }

    return fetch(resource, requestOptions).then(response => {
        if (response.status === 401) {
            window.location.assign('/login');
        }
        return response;
    });
}

window.onload = function() {
    setupAdminProfileAvatar();
    renderKycSellerTable();
    loadSalesSummary();
    fetchHeroSlides(); // Fetch from backend instead of hardcoded
    loadModerationProducts();
    renderPayoutsTable();
    const saveCommissionButton = document.getElementById('save-commission-btn');
    if (saveCommissionButton) saveCommissionButton.addEventListener('click', saveCommission);

    document.querySelectorAll('.nav-menu .nav-item a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            if (view) {
                switchView(view);
            }
        });
    });

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

    function syncMobileButtons() {
        const show = window.innerWidth <= 1024;
        if (openSidebarBtn) openSidebarBtn.style.display = show ? 'flex' : 'none';
        if (closeSidebarBtn) closeSidebarBtn.style.display = show ? 'flex' : 'none';
    }
    syncMobileButtons();
    window.addEventListener('resize', syncMobileButtons);

    // ============================================
    // IMAGE PREVIEW FUNCTIONALITY FOR SLIDE UPLOAD
    // ============================================
    const imageFileInput = document.getElementById('slide-image-file');
    if (imageFileInput) {
        imageFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image size must be less than 5MB', 'danger');
                    this.value = '';
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewContainer = document.getElementById('image-preview-container');
                    const previewImage = document.getElementById('image-preview');
                    if (previewContainer && previewImage) {
                        previewImage.src = e.target.result;
                        previewContainer.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            } else {
                const previewContainer = document.getElementById('image-preview-container');
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
            }
        });
    }
};

function setupAdminProfileAvatar() {
    const button = document.getElementById('admin-avatar-button');
    const fileInput = document.getElementById('admin-avatar-file');
    const avatar = document.getElementById('admin-avatar');
    if (!button || !fileInput || !avatar) return;

    button.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            showToast('Choose a PNG or JPEG image.', 'danger');
            fileInput.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('Profile pictures must be 5 MB or smaller.', 'danger');
            fileInput.value = '';
            return;
        }

        button.disabled = true;
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await adminFetch('/api/admin/profile/avatar', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || `Profile picture upload failed (${response.status})`);
            }

            avatar.src = result.avatarUrl;
            showToast('Profile picture updated.', 'success');
        } catch (error) {
            console.error('Error uploading admin profile picture:', error);
            showToast(error.message || 'Could not update profile picture.', 'danger');
        } finally {
            button.disabled = false;
            fileInput.value = '';
        }
    });
}

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

// Fetch seller documentation from backend
async function fetchSellerDocumentation(status = null) {
    let url = '/api/admin/seller-documentation';
    if (status && status !== 'ALL') {
        url = `/api/admin/seller-documentation/status/${status.toLowerCase()}`;
    }

    const response = await adminFetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch seller documentation (${response.status})`);
    }

    const applications = await response.json();
    if (!Array.isArray(applications)) {
        throw new Error('Seller documentation response was not a list');
    }
    return applications;
}

// FIXED renderKycSellerTable — always fetch ALL sellers, filter status client-side
async function renderKycSellerTable() {
    const tbody = document.getElementById('sellers-kyc-tbody');
    const searchInput = document.getElementById('seller-kyc-search');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    if (!tbody) return;

    try {
        // Fetch the complete database-backed list so dashboard counts and charts use the same source.
        sellers = await fetchSellerDocumentation(null);
    } catch (error) {
        console.error('Error fetching seller documentation:', error);
        showToast('Failed to load seller records', 'danger');
        setDashboardUnavailable();
        tbody.innerHTML = `<tr><td colspan="7" class="seller-data-message">Unable to load seller records.</td></tr>`;
        return;
    }

    const getStatus = seller => (seller.status || '').trim().toLowerCase();
    const pendingCount = sellers.filter(s => getStatus(s) === 'pending').length;
    const approvedCount = sellers.filter(s => getStatus(s) === 'approved').length;
    const rejectedCount = sellers.filter(s => getStatus(s) === 'rejected').length;

    // Populate all seller dashboard summaries from the database response.
    const navBadge = document.getElementById('nav-pending-kyc-badge');
    if (navBadge) navBadge.innerText = pendingCount;
    const dashCount = document.getElementById('dash-kyc-count');
    if (dashCount) dashCount.innerText = pendingCount;
    const statPending = document.getElementById('stat-pending-kyc');
    if (statPending) statPending.innerText = pendingCount;
    const statApproved = document.getElementById('stat-approved-sellers');
    if (statApproved) statApproved.innerText = approvedCount;
    const statRejected = document.getElementById('stat-rejected-sellers');
    if (statRejected) statRejected.innerText = rejectedCount;
    const statTotal = document.getElementById('stat-total-sellers');
    if (statTotal) statTotal.innerText = sellers.length;

    const countPendingTab = document.getElementById('count-pending-tab');
    if (countPendingTab) countPendingTab.innerText = pendingCount;
    const countApprovedTab = document.getElementById('count-approved-tab');
    if (countApprovedTab) countApprovedTab.innerText = approvedCount;
    const countRejectedTab = document.getElementById('count-rejected-tab');
    if (countRejectedTab) countRejectedTab.innerText = rejectedCount;

    renderDashboardActivity(sellers);
    initSellerCategoryChart(sellers);

    // Filter by active tab status + search (done client-side now)
    const filtered = sellers.filter(s => {
        const displayStatus = getStatus(s);

        const matchStatus = currentKycFilter === 'ALL' ||
            displayStatus === currentKycFilter.toLowerCase();

        const matchSearch = (s.storeName && s.storeName.toLowerCase().includes(search)) ||
            (s.businessEmail && s.businessEmail.toLowerCase().includes(search)) ||
            (s.taxId && s.taxId.toLowerCase().includes(search));

        return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="seller-data-message">No seller applications match this filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        let statusBadge = '';
        const displayStatus = getStatus(s);
        if (displayStatus === 'pending') {
            statusBadge = `<span class="badge badge-pending">Pending KYC Review</span>`;
        } else if (displayStatus === 'approved') {
            statusBadge = `<span class="badge badge-approved">Active Verified Seller</span>`;
        } else if (displayStatus === 'rejected') {
            statusBadge = `<span class="badge badge-rejected">Application Rejected</span>`;
        } else {
            statusBadge = `<span class="badge">Status unavailable</span>`;
        }

        return `
            <tr>
                <td>
                    <p class="cell-strong">${s.storeName || 'N/A'}</p>
                    <p class="cell-muted">${s.businessEmail || 'N/A'}</p>
                </td>
                <td>${s.accountHolder || s.userName || 'N/A'}</td>
                <td class="mono">${s.taxId || 'N/A'}</td>
                <td>${s.primaryCategory || 'N/A'}</td>
                <td class="cell-muted">${s.createdAt ? s.createdAt.substring(0, 10) : 'N/A'}</td>
                <td>${statusBadge}</td>
                <td class="text-right">
                    <button onclick="openKycModal(${s.id})" class="btn btn-primary btn-sm">
                        <i class="fa-solid fa-file-magnifying-glass"></i> ${displayStatus === 'pending' ? 'Inspect Credentials' : 'View KYC Profile'}
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
    document.getElementById('kyc-modal-store-name').innerText = seller.storeName || 'Store Verification Request';
    document.getElementById('kyc-modal-applicant').innerText = `Applicant: ${seller.accountHolder || seller.userName || 'N/A'} • Applied: ${seller.createdAt ? seller.createdAt.substring(0, 10) : 'N/A'}`;

    document.getElementById('kyc-info-store').innerText = seller.storeName || 'N/A';
    document.getElementById('kyc-info-category').innerText = seller.primaryCategory || 'N/A';
    document.getElementById('kyc-info-pan').innerText = seller.taxId || 'N/A';
    document.getElementById('kyc-info-regno').innerText = seller.businessRegistrationNumber || 'N/A';

    document.getElementById('kyc-info-user').innerText = seller.accountHolder || seller.userName || 'N/A';
    document.getElementById('kyc-info-phone').innerText = seller.phoneNumber || 'N/A';
    document.getElementById('kyc-info-bank').innerText = seller.bankName || 'N/A';
    document.getElementById('kyc-info-acc').innerText = seller.accountIbanMasked ? 'Loading…' : 'N/A';

    revealSellerBankAccount(id);

    switchKycDocTab('citizenship');
    document.getElementById('modal-seller-kyc').classList.add('active');
}

async function revealSellerBankAccount(documentationId) {
    try {
        const response = await adminFetch(`/api/admin/seller-documentation/${documentationId}/reveal-bank`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Could not reveal account number');
        if (activeKycSellerId !== documentationId) return;
        document.getElementById('kyc-info-acc').innerText = data.accountIban || 'N/A';
    } catch (error) {
        if (activeKycSellerId !== documentationId) return;
        document.getElementById('kyc-info-acc').innerText = 'Unavailable';
        showToast(error.message, 'danger');
    }
}

function closeKycModal() {
    document.getElementById('modal-seller-kyc').classList.remove('active');
}

function switchKycDocTab(key) {
    activeKycDocKey = key;
    const seller = sellers.find(s => s.id === activeKycSellerId);
    let docUrl = '';

    if (seller && seller.documents) {
        if (key === 'citizenship') docUrl = seller.documents.govId || '';
        if (key === 'regCert') docUrl = seller.documents.bizCert || '';
        if (key === 'taxClearance') docUrl = seller.documents.addressProof || '';
    }

    ['citizenship', 'regCert', 'taxClearance'].forEach(k => {
        const tabBtn = document.getElementById(`doc-tab-${k}`);
        if (tabBtn) tabBtn.classList.toggle('active', k === key);
    });

    const preview = document.getElementById('kyc-doc-img-preview');
    const emptyState = document.getElementById('kyc-doc-empty');
    const fullSizeButton = document.getElementById('view-full-size-btn');
    preview.hidden = !docUrl;
    if (docUrl) preview.src = docUrl;
    else preview.removeAttribute('src');
    if (emptyState) emptyState.hidden = Boolean(docUrl);
    if (fullSizeButton) fullSizeButton.disabled = !docUrl;
}

function openDocLightbox() {
    const preview = document.getElementById('kyc-doc-img-preview');
    const imgUrl = preview.getAttribute('src');
    if (!imgUrl || preview.hidden) return;
    document.getElementById('lightbox-img').src = imgUrl;
    document.getElementById('modal-lightbox').style.display = 'flex';
}

function closeDocLightbox() {
    document.getElementById('modal-lightbox').style.display = 'none';
}

async function approveSellerKyc() {
    if (!activeKycSellerId) return;

    try {
        const response = await adminFetch(`/api/admin/seller-documentation/${activeKycSellerId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (result.success) {
            showToast(`Seller "${sellers.find(s => s.id === activeKycSellerId)?.storeName}" approved! Account upgraded to Active Seller.`, 'success');
            renderKycSellerTable();
            closeKycModal();
        } else {
            showToast('Failed to approve application', 'danger');
        }
    } catch (error) {
        console.error('Error approving application:', error);
        showToast('Error approving application', 'danger');
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

async function submitKycRejection(e) {
    e.preventDefault();
    if (!activeKycSellerId) return;

    const note = document.getElementById('reject-custom-note').value;

    try {
        const response = await adminFetch(`/api/admin/seller-documentation/${activeKycSellerId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: note })
        });

        const result = await response.json();
        if (result.success) {
            showToast(`Seller application for "${sellers.find(s => s.id === activeKycSellerId)?.storeName}" was rejected. Notice sent.`, 'danger');
            renderKycSellerTable();
            closeRejectReasonModal();
            closeKycModal();
        } else {
            showToast('Failed to reject application', 'danger');
        }
    } catch (error) {
        console.error('Error rejecting application:', error);
        showToast('Error rejecting application', 'danger');
    }
}

// ============================================
// HERO SLIDES - FETCH FROM BACKEND
// ============================================

// Fetch hero slides from backend
async function fetchHeroSlides() {
    try {
        const response = await adminFetch('/api/admin/hero-slides');
        const result = await response.json();

        if (result.success && result.slides) {
            // Convert backend format to frontend format
            heroSlides = result.slides.map(s => ({
                id: s.id,
                title: s.title,
                subtitle: s.subtitle || '',
                ctaText: s.ctaText || 'Shop Now',
                ctaUrl: s.ctaUrl || '',
                imageUrl: s.imageUrl,
                priority: s.priority,
                active: s.active
            }));
        } else {
            // If no slides in database, use empty array
            heroSlides = [];
        }
        renderHeroSlidesCMS();
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        showToast('Failed to load hero slides', 'danger');
        heroSlides = [];
        renderHeroSlidesCMS();
    }
}

// CMS & Hero Banner Engine
function renderHeroSlidesCMS() {
    const container = document.getElementById('hero-slides-list');
    if (!container) return;

    const badge = document.getElementById('slide-count-badge');
    if (badge) badge.innerText = `${heroSlides.filter(s => s.active).length} Slides Active`;

    if (heroSlides.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No hero slides found. Click "Add New Hero Slide" to create one.</div>`;
        updateMockHeroPreview();
        return;
    }

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
    if (activeSlides.length === 0) {
        // Show placeholder if no active slides
        const img = document.getElementById('mock-slide-img');
        const title = document.getElementById('mock-slide-title');
        const subtitle = document.getElementById('mock-slide-subtitle');
        const btn = document.getElementById('mock-slide-btn');
        const route = document.getElementById('mock-slide-route');

        if (img) img.src = '';
        if (title) title.innerText = 'No Active Slides';
        if (subtitle) subtitle.innerText = 'Add a slide to see preview';
        if (btn) btn.innerText = 'Shop Now';
        if (route) route.innerText = 'aalmari.com';

        const dotsContainer = document.getElementById('mock-slider-dots');
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

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

// ============================================
// UPDATED: openAddSlideModal with file input clear
// ============================================
function openAddSlideModal() {
    document.getElementById('modal-slide-header').innerText = "Add Homepage Hero Slide";
    document.getElementById('slide-form').reset();
    document.getElementById('slide-id').value = "";

    // Clear file input and preview
    const fileInput = document.getElementById('slide-image-file');
    if (fileInput) fileInput.value = '';

    const previewContainer = document.getElementById('image-preview-container');
    if (previewContainer) {
        previewContainer.style.display = 'none';
        const previewImage = document.getElementById('image-preview');
        if (previewImage) previewImage.src = '';
    }

    document.getElementById('modal-hero-slide').classList.add('active');
}

// ============================================
// UPDATED: editSlide with file input handling
// ============================================
function editSlide(id) {
    const s = heroSlides.find(item => item.id === id);
    if (!s) return;

    document.getElementById('modal-slide-header').innerText = "Edit Homepage Hero Banner";
    document.getElementById('slide-id').value = s.id;
    document.getElementById('slide-title').value = s.title;
    document.getElementById('slide-subtitle').value = s.subtitle;
    document.getElementById('slide-cta').value = s.ctaText;
    document.getElementById('slide-route').value = s.ctaUrl;

    // Cannot set file input value for security reasons
    // Clear file input and show existing image in preview
    const fileInput = document.getElementById('slide-image-file');
    if (fileInput) fileInput.value = '';

    // Show current image in preview
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    if (previewContainer && previewImage && s.imageUrl) {
        previewImage.src = s.imageUrl;
        previewContainer.style.display = 'block';
    }

    document.getElementById('slide-priority').value = s.priority;
    document.getElementById('slide-active').value = s.active.toString();

    document.getElementById('modal-hero-slide').classList.add('active');
}

function closeSlideModal() {
    document.getElementById('modal-hero-slide').classList.remove('active');
}

// ============================================
// UPDATED: handleSlideSubmit with S3 upload
// ============================================
async function handleSlideSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('slide-id').value;
    const title = document.getElementById('slide-title').value;
    const subtitle = document.getElementById('slide-subtitle').value;
    const ctaText = document.getElementById('slide-cta').value;
    const ctaUrl = document.getElementById('slide-route').value;
    const imageFileInput = document.getElementById('slide-image-file');
    const imageFile = imageFileInput ? imageFileInput.files[0] : null;
    const priority = parseInt(document.getElementById('slide-priority').value);
    const active = document.getElementById('slide-active').value === 'true';

    // Validate image upload for new slides
    if (!imageFile && !id) {
        showToast('Please upload an image for the slide', 'danger');
        return;
    }

    try {
        let imageUrl = '';

        // If there's a file, upload it to S3 first
        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);

            showToast('Uploading image...', 'info');

            const uploadResponse = await adminFetch('/api/admin/upload-slide-image', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                showToast('Failed to upload image: ' + (errorData.message || 'Server error'), 'danger');
                return;
            }

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success) {
                showToast('Failed to upload image: ' + uploadResult.message, 'danger');
                return;
            }

            imageUrl = uploadResult.imageUrl;
            showToast('Image uploaded successfully', 'success');
        }

        // Prepare slide data with S3 URL
        const slideData = {
            title,
            subtitle,
            ctaText,
            ctaUrl,
            imageUrl: imageUrl, // S3 URL from upload, or empty if editing without new image
            priority,
            active
        };

        // If editing and no new image uploaded, use existing image URL
        if (id && !imageUrl) {
            const existingSlide = heroSlides.find(s => s.id == id);
            if (existingSlide) {
                slideData.imageUrl = existingSlide.imageUrl;
            }
        }

        // Save slide to backend
        const response = await adminFetch('/api/admin/hero-slides', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(slideData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            showToast('Failed to save slide: ' + (errorData.message || 'Server error'), 'danger');
            return;
        }

        const result = await response.json();

        if (result.success) {
            showToast(id ? 'Hero banner updated successfully' : 'New slide added successfully', 'success');
            closeSlideModal();
            fetchHeroSlides(); // Refresh from backend
        } else {
            showToast('Failed to save slide: ' + (result.message || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error saving slide:', error);
        showToast('Error saving slide: ' + error.message, 'danger');
    }
}

// ============================================
// UPDATED: toggleSlideActive - calls backend API
// ============================================
async function toggleSlideActive(id) {
    try {
        const response = await adminFetch(`/api/admin/hero-slides/${id}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast(`Slide visibility set to ${result.active ? 'Active' : 'Draft'}`, 'info');
            fetchHeroSlides(); // Refresh from backend
        } else {
            showToast('Failed to toggle slide: ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error toggling slide:', error);
        showToast('Error toggling slide status', 'danger');
    }
}

// ============================================
// UPDATED: deleteSlide - calls backend API
// ============================================
async function deleteSlide(id) {
    if (!confirm('Are you sure you want to delete this slide?')) {
        return;
    }

    try {
        const response = await adminFetch(`/api/admin/hero-slides/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('Hero slide banner deleted', 'danger');
            fetchHeroSlides(); // Refresh from backend
        } else {
            showToast('Failed to delete slide: ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting slide:', error);
        showToast('Error deleting slide', 'danger');
    }
}

/* Product Moderation & Payout Logic */
async function loadModerationProducts(page = productModerationPage.page) {
    productModerationState = 'loading';
    productModerationError = '';
    renderProductsModerationTable();

    try {
        const response = await adminFetch(
            `/api/admin/products?page=${page}&size=${PRODUCT_MODERATION_PAGE_SIZE}`);
        if (!response.ok) {
            throw new Error(`Failed to load product records (${response.status})`);
        }

        const result = await response.json();
        if (Array.isArray(result)) {
            throw new Error('The admin server is running an older product API. Restart AalmariAdminPortal to enable pagination.');
        }
        if (!result || !Array.isArray(result.content)
                || !Number.isInteger(result.page) || !Number.isInteger(result.totalPages)
                || !Number.isFinite(result.totalElements) || !Number.isFinite(result.pendingCount)) {
            throw new Error('The product API returned an invalid paginated response. Restart AalmariAdminPortal and try again.');
        }

        vendorProducts = result.content;
        productModerationPage = {
            page: result.page,
            totalPages: result.totalPages,
            totalElements: result.totalElements,
            pendingCount: result.pendingCount
        };
        productModerationState = 'loaded';
    } catch (error) {
        console.error('Error loading products for moderation:', error);
        productModerationError = error.message || 'Could not load products.';
        productModerationState = 'error';
    }

    renderProductsModerationTable();
}

function changeModerationPage(page) {
    if (page < 0 || page >= productModerationPage.totalPages || page === productModerationPage.page) return;
    loadModerationProducts(page);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function renderProductsModerationTable() {
    const tbody = document.getElementById('products-moderation-tbody');
    const sidebarCount = document.getElementById('sidebar-product-count');
    const pagination = document.getElementById('products-moderation-pagination');

    if (!tbody) return;

    if (productModerationState === 'loading') {
        if (sidebarCount) sidebarCount.innerText = '—';
        tbody.innerHTML = '<tr><td colspan="8" class="seller-data-message">Loading products…</td></tr>';
        if (pagination) pagination.innerHTML = '';
        return;
    }

    if (productModerationState === 'error') {
        if (sidebarCount) sidebarCount.innerText = '!';
        tbody.innerHTML = `<tr><td colspan="8" class="seller-data-message">${escapeHtml(productModerationError)} <button type="button" class="product-status-toggle" onclick="loadModerationProducts()">Retry</button></td></tr>`;
        if (pagination) pagination.innerHTML = '';
        return;
    }

    if (sidebarCount) {
        sidebarCount.innerText = String(productModerationPage.pendingCount);
    }

    if (vendorProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="seller-data-message">No vendor products found.</td></tr>';
        renderProductsModerationPagination();
        return;
    }

    tbody.innerHTML = vendorProducts.map(p => `
        <tr>
            <td class="cell-strong">${escapeHtml(p.title)}</td>
            <td>${escapeHtml(p.store)}</td>
            <td class="cell-muted">${escapeHtml(p.category)}</td>
            <td class="cell-strong">NPR ${Number(p.price).toLocaleString('en-IN')}</td>
            <td>${Number(p.stock).toLocaleString('en-IN')} units</td>
            <td>
                <span class="badge ${p.approvalStatus === 'APPROVED' ? 'badge-approved' : p.approvalStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}">${escapeHtml(p.approvalStatus)}</span>
            </td>
            <td class="text-right">
                <button type="button" onclick="setProductActive(${Number(p.id)}, ${!p.active})" class="product-status-toggle">
                    ${p.active ? 'Deactivate' : 'Activate'}
                </button>
            </td>
            <td class="text-right">
                ${p.approvalStatus !== 'APPROVED' ? `<button type="button" onclick="setProductApprovalStatus(${Number(p.id)}, 'APPROVED')" class="product-status-toggle approve">Approve</button>` : ''}
                ${p.approvalStatus !== 'REJECTED' ? `<button type="button" onclick="setProductApprovalStatus(${Number(p.id)}, 'REJECTED')" class="product-status-toggle reject">Reject</button>` : ''}
            </td>
        </tr>
    `).join('');
    renderProductsModerationPagination();
}

function renderProductsModerationPagination() {
    const pagination = document.getElementById('products-moderation-pagination');
    if (!pagination) return;

    const start = productModerationPage.totalElements === 0
        ? 0
        : productModerationPage.page * PRODUCT_MODERATION_PAGE_SIZE + 1;
    const end = Math.min(
        (productModerationPage.page + 1) * PRODUCT_MODERATION_PAGE_SIZE,
        productModerationPage.totalElements);

    pagination.innerHTML = `
        <span class="product-pagination-summary">Showing ${start}–${end} of ${productModerationPage.totalElements} products</span>
        <div class="product-pagination-controls">
            <button type="button" class="product-pagination-button"
                    onclick="changeModerationPage(${productModerationPage.page - 1})"
                    ${productModerationPage.page === 0 ? 'disabled' : ''} aria-label="Previous page">Previous</button>
            <span class="product-pagination-page">Page ${productModerationPage.totalPages === 0 ? 0 : productModerationPage.page + 1} of ${productModerationPage.totalPages}</span>
            <button type="button" class="product-pagination-button"
                    onclick="changeModerationPage(${productModerationPage.page + 1})"
                    ${productModerationPage.page + 1 >= productModerationPage.totalPages ? 'disabled' : ''} aria-label="Next page">Next</button>
        </div>`;
}

async function setProductActive(id, active) {
    try {
        const response = await adminFetch(`/api/admin/products/${id}/active`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Product update failed (${response.status})`);
        }

        const productIndex = vendorProducts.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            vendorProducts[productIndex] = result;
        }
        showToast(`Product ${active ? 'activated' : 'deactivated'}`, 'success');
        renderProductsModerationTable();
    } catch (error) {
        console.error('Error updating product listing status:', error);
        showToast(error.message || 'Could not update product status.', 'danger');
    }
}

async function setProductApprovalStatus(id, status) {
    try {
        const response = await adminFetch(`/api/admin/products/${id}/approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Product moderation failed (${response.status})`);
        }

        const productIndex = vendorProducts.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            const previousStatus = vendorProducts[productIndex].approvalStatus;
            if (previousStatus === 'PENDING' && result.approvalStatus !== 'PENDING') {
                productModerationPage.pendingCount = Math.max(0, productModerationPage.pendingCount - 1);
            } else if (previousStatus !== 'PENDING' && result.approvalStatus === 'PENDING') {
                productModerationPage.pendingCount += 1;
            }
            vendorProducts[productIndex] = result;
        }
        showToast(`Product ${status.toLowerCase()}`, 'success');
        renderProductsModerationTable();
    } catch (error) {
        console.error('Error moderating product:', error);
        showToast(error.message || 'Could not update product approval.', 'danger');
    }
}

let payoutPeriodCode = '';

async function renderPayoutsTable() {
    const tbody = document.getElementById('payouts-tbody');
    if (!tbody) return;

    try {
        const response = await adminFetch('/api/admin/payouts');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Payout API request failed');

        payoutPeriodCode = data.periodCode || '';
        const periodLabel = document.getElementById('payout-period');
        if (periodLabel) periodLabel.textContent = data.period || '';

        const commissionInput = document.getElementById('commission-percent');
        if (commissionInput) commissionInput.value = Number(data.commissionPercent || 10).toFixed(2);

        const queue = Array.isArray(data.queue) ? data.queue : [];
        if (!queue.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="seller-data-message">No delivered seller earnings for the prior month.</td></tr>';
            return;
        }

        tbody.innerHTML = queue.map(row => {
            const isPaid = row.status === 'PAID';
            const bank = [row.bankName, row.accountHolder, row.accountIban].filter(Boolean).join(' · ') || 'Not provided';
            return `<tr>
                <td><strong>${escapePayoutText(row.storeName)}</strong></td>
                <td>NPR ${Number(row.grossAmount || 0).toLocaleString('en-IN')}</td>
                <td>${Number(row.commissionPercent || 0).toFixed(2)}% · NPR ${Number(row.commissionAmount || 0).toLocaleString('en-IN')}</td>
                <td><strong>NPR ${Number(row.netAmount || 0).toLocaleString('en-IN')}</strong></td>
                <td><span class="cell-muted">${escapePayoutText(bank)}</span></td>
                <td><span class="badge ${isPaid ? 'badge-approved' : 'badge-pending'}">${isPaid ? 'Paid' : 'Pending'}</span></td>
                <td class="text-right">
                    ${isPaid
                        ? `<span class="cell-muted">${escapePayoutText(row.reference || 'Settled')}</span>`
                        : `<button type="button" class="btn btn-success btn-sm" onclick="settlePayout(${row.sellerId})">Mark paid</button>`}
                </td>
            </tr>`;
        }).join('');
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" class="seller-data-message">Unable to load payout records.</td></tr>';
        showToast(error.message || 'Unable to load payout records', 'danger');
    }
}

function escapePayoutText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

async function saveCommission() {
    const input = document.getElementById('commission-percent');
    if (!input) return;
    const commissionPercent = Number(input.value);
    if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
        showToast('Commission must be between 0 and 100 percent', 'danger');
        return;
    }

    try {
        const response = await adminFetch('/api/admin/payouts/commission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commissionPercent })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save commission');
        showToast(`Commission updated to ${commissionPercent}%`, 'success');
        await renderPayoutsTable();
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function settlePayout(sellerId) {
    const reference = window.prompt('Enter payout bank or transaction reference (optional):', '');
    if (reference === null) return;

    try {
        const response = await adminFetch(`/api/admin/payouts/${sellerId}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ period: payoutPeriodCode, reference })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not settle payout');
        showToast(`Payout marked paid: NPR ${Number(data.netAmount || 0).toLocaleString('en-IN')}`, 'success');
        await renderPayoutsTable();
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

function setDashboardUnavailable() {
    ['stat-total-sellers', 'stat-approved-sellers', 'stat-pending-kyc', 'stat-rejected-sellers', 'dash-kyc-count', 'nav-pending-kyc-badge'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerText = '—';
    });
    ['count-pending-tab', 'count-approved-tab', 'count-rejected-tab'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerText = '—';
    });

    const categoryCanvas = document.getElementById('categoryChart');
    if (categoryCanvas) setChartMessage(categoryCanvas, 'Unable to load seller records.');

    const activityList = document.getElementById('dashboard-activity-list');
    if (activityList) activityList.innerHTML = '<p class="empty-note">Unable to load seller records.</p>';
}

function setChartMessage(canvas, message) {
    canvas.hidden = Boolean(message);
    let status = canvas.parentElement.querySelector('[data-chart-status]');
    if (message) {
        if (!status) {
            status = document.createElement('p');
            status.dataset.chartStatus = 'true';
            status.className = 'chart-status';
            canvas.parentElement.appendChild(status);
        }
        status.textContent = message;
    } else if (status) {
        status.remove();
    }
}

function renderDashboardActivity(sellerRecords) {
    const container = document.getElementById('dashboard-activity-list');
    if (!container) return;

    const pendingSellers = sellerRecords.filter(seller => (seller.status || '').trim().toLowerCase() === 'pending');

    if (pendingSellers.length === 0) {
        container.innerHTML = `<p class="empty-note">No sellers waiting for review.</p>`;
        return;
    }

    container.innerHTML = pendingSellers.slice(0, 5).map(s => `
        <div class="activity-item">
            <div class="activity-left">
                <div class="activity-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <div>
                    <p class="activity-title">${s.storeName || 'Unnamed store'}</p>
                    <p class="activity-sub">Applicant: ${s.accountHolder || 'Not provided'} • Category: ${s.primaryCategory || 'Not provided'}</p>
                </div>
            </div>
            <a href="javascript:void(0)" onclick="switchView('seller-kyc'); openKycModal(${s.id});" class="activity-link">
                Review application <i class="fa-solid fa-arrow-right"></i>
            </a>
        </div>
    `).join('');
}

let grossSalesChart = null;
let sellerCategoryChart = null;

async function loadSalesSummary() {
    const salesValue = document.getElementById('stat-gmv');
    const chartCanvas = document.getElementById('marketplaceChart');
    if (!salesValue || !chartCanvas) return;

    try {
        const response = await fetch(`${SHOPPING_API_BASE_URL}/api/admin/sales/summary`);
        if (!response.ok) {
            throw new Error(`Sales summary request failed (${response.status})`);
        }

        const summary = await response.json();
        if (summary.currency !== 'NPR' || !Number.isFinite(summary.grossSales) || !Array.isArray(summary.monthlySales)) {
            throw new Error('Sales summary response has an invalid format');
        }

        salesValue.innerText = `NPR ${summary.grossSales.toLocaleString('en-IN')}`;
        const monthlySales = summary.monthlySales.filter(item =>
            typeof item.month === 'string' && Number.isFinite(item.grossSales)
        );
        if (monthlySales.length !== summary.monthlySales.length) {
            throw new Error('Sales summary contains invalid monthly values');
        }
        initGrossSalesChart(monthlySales);
    } catch (error) {
        console.error('Error fetching gross sales summary:', error);
        salesValue.innerText = 'NPR —';
        setChartMessage(chartCanvas, 'Sales data unavailable. Check the Aalmari Shopping connection.');
    }
}

function initGrossSalesChart(monthlySales) {
    const canvas = document.getElementById('marketplaceChart');
    if (!canvas) return;
    if (grossSalesChart) grossSalesChart.destroy();
    setChartMessage(canvas, monthlySales.length ? '' : 'No monthly sales data is available.');

    if (monthlySales.length === 0) return;

    grossSalesChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: monthlySales.map(item => item.month),
            datasets: [{
                label: 'Gross sales (NPR)',
                data: monthlySales.map(item => item.grossSales),
                borderColor: '#ea6300',
                backgroundColor: 'rgba(234, 99, 0, 0.10)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#ea6300',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { grid: { display: false }, border: { color: '#e7e2dc' }, ticks: { color: '#57534e', font: { family: 'DM Sans', size: 11 } } },
                y: { beginAtZero: true, border: { display: false }, grid: { color: '#e7e2dc' }, ticks: { color: '#57534e', font: { family: 'DM Sans', size: 11 }, callback: value => `NPR ${Number(value).toLocaleString('en-IN')}` } }
            },
            plugins: {
                legend: { position: 'top', align: 'start', labels: { usePointStyle: true, boxWidth: 8, color: '#57534e', font: { family: 'DM Sans', size: 11 } } },
                tooltip: { backgroundColor: '#1c1917', titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' }, padding: 10, cornerRadius: 6, callbacks: { label: context => `NPR ${Number(context.parsed.y).toLocaleString('en-IN')}` } }
            }
        }
    });
}

function initSellerCategoryChart(sellerRecords) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    if (sellerCategoryChart) sellerCategoryChart.destroy();

    const categoryApplications = new Map();
    sellerRecords.forEach(seller => {
        const category = (seller.primaryCategory || '').trim();
        if (category) {
            categoryApplications.set(category, (categoryApplications.get(category) || 0) + 1);
        }
    });

    const categoryEntries = [...categoryApplications.entries()].sort((a, b) => b[1] - a[1]);
    const categoryColors = ['#ea6300', '#f59e0b', '#c2410c', '#292524'];

    setChartMessage(canvas, categoryEntries.length ? '' : 'Seller categories are not available.');
    if (categoryEntries.length === 0) return;

    sellerCategoryChart = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: categoryEntries.map(([category]) => category),
            datasets: [{ data: categoryEntries.map(([, count]) => count), backgroundColor: categoryEntries.map((_, index) => categoryColors[index % categoryColors.length]), borderColor: '#ffffff', borderWidth: 3, hoverOffset: 3 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: '#57534e', font: { family: 'DM Sans', size: 11 }, padding: 12 } },
                tooltip: { backgroundColor: '#1c1917', titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' }, padding: 10, cornerRadius: 6 }
            }
        }
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