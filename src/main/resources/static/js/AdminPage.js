// Global variable to store fetched sellers data
let sellers = [];
let heroSlides = []; // Start empty, will fetch from backend

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
    fetchHeroSlides(); // Fetch from backend instead of hardcoded
    renderProductsModerationTable();
    renderPayoutsTable();
    initMarketplaceCharts();

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
    try {
        let url = '/api/admin/seller-documentation';
        if (status && status !== 'ALL') {
            url = `/api/admin/seller-documentation/status/${status.toLowerCase()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch seller documentation');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching seller documentation:', error);
        showToast('Failed to load seller applications', 'danger');
        return [];
    }
}

// FIXED renderKycSellerTable — always fetch ALL sellers, filter status client-side
async function renderKycSellerTable() {
    const tbody = document.getElementById('sellers-kyc-tbody');
    const searchInput = document.getElementById('seller-kyc-search');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    if (!tbody) return;

    // ALWAYS fetch the full unfiltered list — this is the fix
    sellers = await fetchSellerDocumentation(null);

    // Calculate counts from the COMPLETE dataset
    const pendingCount = sellers.filter(s => s.status === 'pending').length;
    const approvedCount = sellers.filter(s => s.status === 'approved').length;
    const rejectedCount = sellers.filter(s => s.status === 'rejected').length;

    // Update UI counts
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

    // Filter by active tab status + search (done client-side now)
    const filtered = sellers.filter(s => {
        const displayStatus = s.status ? s.status.toLowerCase() : 'pending';

        const matchStatus = currentKycFilter === 'ALL' ||
            displayStatus === currentKycFilter.toLowerCase();

        const matchSearch = (s.storeName && s.storeName.toLowerCase().includes(search)) ||
            (s.businessEmail && s.businessEmail.toLowerCase().includes(search)) ||
            (s.taxId && s.taxId.toLowerCase().includes(search));

        return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No seller applications matching this criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        let statusBadge = '';
        const displayStatus = s.status ? s.status.toLowerCase() : 'pending';
        if (displayStatus === 'pending') {
            statusBadge = `<span class="badge badge-pending">Pending KYC Review</span>`;
        } else if (displayStatus === 'approved') {
            statusBadge = `<span class="badge badge-approved">Active Verified Seller</span>`;
        } else {
            statusBadge = `<span class="badge badge-rejected">Application Rejected</span>`;
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
    document.getElementById('kyc-info-acc').innerText = seller.accountIban || 'N/A';

    switchKycDocTab('citizenship');
    document.getElementById('modal-seller-kyc').classList.add('active');
}

function closeKycModal() {
    document.getElementById('modal-seller-kyc').classList.remove('active');
}

function switchKycDocTab(key) {
    activeKycDocKey = key;
    const seller = sellers.find(s => s.id === activeKycSellerId);
    let docUrl = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80';

    if (seller && seller.documents) {
        if (key === 'citizenship') docUrl = seller.documents.govId || docUrl;
        if (key === 'regCert') docUrl = seller.documents.bizCert || docUrl;
        if (key === 'taxClearance') docUrl = seller.documents.addressProof || docUrl;
    }

    ['citizenship', 'regCert', 'taxClearance'].forEach(k => {
        const tabBtn = document.getElementById(`doc-tab-${k}`);
        if (tabBtn) tabBtn.classList.toggle('active', k === key);
    });

    document.getElementById('kyc-doc-img-preview').src = docUrl;
}

function openDocLightbox() {
    const imgUrl = document.getElementById('kyc-doc-img-preview').src;
    document.getElementById('lightbox-img').src = imgUrl;
    document.getElementById('modal-lightbox').style.display = 'flex';
}

function closeDocLightbox() {
    document.getElementById('modal-lightbox').style.display = 'none';
}

async function approveSellerKyc() {
    if (!activeKycSellerId) return;

    try {
        const response = await fetch(`/api/admin/seller-documentation/${activeKycSellerId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (result.success) {
            showToast(`Seller "${sellers.find(s => s.id === activeKycSellerId)?.storeName}" approved! Account upgraded to Active Seller.`, 'success');
            renderKycSellerTable();
            renderDashboardActivity();
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
        const response = await fetch(`/api/admin/seller-documentation/${activeKycSellerId}/reject`, {
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
            renderDashboardActivity();
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
        const response = await fetch('/api/admin/hero-slides');
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

            const uploadResponse = await fetch('/api/admin/upload-slide-image', {
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
        const response = await fetch('/api/admin/hero-slides', {
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
        const response = await fetch(`/api/admin/hero-slides/${id}/toggle`, {
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
        const response = await fetch(`/api/admin/hero-slides/${id}`, {
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

async function renderDashboardActivity() {
    const container = document.getElementById('dashboard-activity-list');
    if (!container) return;

    const pendingSellers = await fetchSellerDocumentation('pending');

    if (pendingSellers.length === 0) {
        container.innerHTML = `<p class="empty-note">All pending seller verification requests handled.</p>`;
        return;
    }

    container.innerHTML = pendingSellers.slice(0, 5).map(s => `
        <div class="activity-item">
            <div class="activity-left">
                <div class="activity-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <div>
                    <p class="activity-title">${s.storeName} applied to become Seller</p>
                    <p class="activity-sub">Applicant: ${s.accountHolder || s.userName} • Category: ${s.primaryCategory}</p>
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