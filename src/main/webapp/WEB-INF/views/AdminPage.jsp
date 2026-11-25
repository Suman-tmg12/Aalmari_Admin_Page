<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" isELIgnored="true" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ page import="org.springframework.security.web.csrf.CsrfToken" %>
<%
    CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <% if (csrfToken != null) { %>
    <meta name="_csrf" content="<%= csrfToken.getToken() %>">
    <meta name="_csrf_header" content="<%= csrfToken.getHeaderName() %>">
    <% } %>
    <title>Aalmari Multi-Vendor Marketplace - Admin Portal</title>
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Design System Stylesheet (replaces Tailwind) -->
    <link rel="stylesheet" href="<%= request.getContextPath() %>/css/AdminPage.css?v=20261125-1740">
    <meta name="aalmari-shopping-api-base" content="http://localhost:8080">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
</head>
<body>

    <!-- Toast Notification Container -->
    <div id="toast-container"></div>

    <div class="admin-wrapper">

        <!-- Sidebar -->
        <aside id="sidebar" class="sidebar">
            <div class="sidebar-header">
                <div class="brand-logo">
               <a href="/">
             <img src="/images/logo/aalmarilogo.png" width="80px" height="80px" alt="Logo" />
             </a>
              <div class="aalmari-logo-name">
              <div class="aalamri-name">AALMARI</div>
              <div class="aalmari-admin-portal">ADMIN PORTAL</div>
              </div>
                </div>
                <button id="close-sidebar-btn" class="icon-btn" style="display:none;">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <ul class="nav-menu custom-scrollbar">
                <li class="nav-section-title">Main Management</li>

                <li class="nav-item active">
                    <a href="#dashboard" data-view="dashboard">
                        <span class="nav-item-content"><i class="fa-solid fa-chart-pie"></i><span>Overview &amp; Stats</span></span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="#seller-kyc" data-view="seller-kyc">
                        <span class="nav-item-content"><i class="fa-solid fa-id-card"></i><span>Seller KYC Approvals</span></span>
                        <span id="nav-pending-kyc-badge" class="nav-badge">—</span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="#homepage-cms" data-view="homepage-cms">
                        <span class="nav-item-content"><i class="fa-solid fa-sliders"></i><span>Homepage Banner CMS</span></span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="#product-moderation" data-view="product-moderation">
                        <span class="nav-item-content"><i class="fa-solid fa-boxes-stacked"></i><span>Product Moderation</span></span>
                        <span class="nav-badge" id="sidebar-product-count">—</span>
                    </a>
                </li>

                <li class="nav-section-title">Financials &amp; Rates</li>

                <li class="nav-item">
                    <a href="#payouts" data-view="payouts">
                        <span class="nav-item-content"><i class="fa-solid fa-hand-holding-dollar"></i><span>Payouts &amp; Commissions</span></span>
                    </a>
                </li>

                <li class="nav-section-title">System Settings</li>

                <li class="nav-item">
                    <a href="#settings" data-view="settings">
                        <span class="nav-item-content"><i class="fa-solid fa-gears"></i><span>Marketplace Settings</span></span>
                    </a>
                </li>
            </ul>

            <div class="sidebar-footer">
                <a href="#homepage-cms" onclick="switchView('homepage-cms')" class="quick-link-card">
                    <span><i class="fa-solid fa-mobile-screen"></i>&nbsp; Live Store Banner Mock</span>
                    <i class="fa-solid fa-angle-right"></i>
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="main-content">

            <header class="top-navbar">
                <div style="display:flex; align-items:center; gap:1rem;">
                    <button id="open-sidebar-btn" class="icon-btn" style="display:none;">
                        <i class="fa-solid fa-bars"></i>
                    </button>

                    <div class="search-box">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" id="global-search" placeholder="Search sellers, PAN IDs, products, or order numbers...">
                    </div>
                </div>

                <div class="header-actions">


                    <button id="notif-btn" class="icon-btn">
                        <i class="fa-regular fa-bell"></i>
                        <span class="notification-dot"></span>
                    </button>

                    <div class="user-profile">
                        <img class="avatar" src="<%= request.getContextPath() %>/images/admin-profile.svg?v=20261121" alt="Super Admin">
                        <div class="user-info">
                            <h4><%= request.getUserPrincipal().getName() %></h4>
                            <p>Aalmari Operations</p>
                        </div>
                    </div>
                    <form action="<%= request.getContextPath() %>/logout" method="post">
                        <% if (csrfToken != null) { %>
                        <input type="hidden" name="<%= csrfToken.getParameterName() %>" value="<%= csrfToken.getToken() %>">
                        <% } %>
                        <button class="icon-btn" type="submit" title="Sign out" aria-label="Sign out">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </form>
                </div>
            </header>

            <main class="page-container custom-scrollbar" style="overflow-y:auto;">

                <!-- VIEW 1: DASHBOARD -->
                <section id="view-dashboard">
                    <div class="page-header">
                        <div>
                            <h1>Overview</h1>
                            <p>Seller records and application status</p>
                        </div>
                        <button onclick="switchView('seller-kyc')" class="btn btn-warning">
                            <i class="fa-solid fa-user-check"></i> Review Sellers (<span id="dash-kyc-count">—</span>)
                        </button>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title">Gross sales (GMV)</span>
                                    <div class="stat-icon"><i class="fa-solid fa-money-bill-trend-up"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value" id="stat-gmv">NPR —</h3>
                                </div>
                                <p class="stat-footnote">Delivered product sales, before commission and delivery fees.</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                        <span class="stat-title">Seller applications</span>
                                    <div class="stat-icon icon-emerald"><i class="fa-solid fa-users"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value" id="stat-total-sellers">—</h3>
                                </div>
                                <p class="stat-footnote">All recorded seller applications</p>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title">Approved sellers</span>
                                    <div class="stat-icon icon-emerald"><i class="fa-solid fa-circle-check"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value" id="stat-approved-sellers">—</h3>
                                </div>
                                <p class="stat-footnote">Status: approved</p>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title" style="color:var(--danger);">Rejected applications</span>
                                    <div class="stat-icon icon-emerald"><i class="fa-solid fa-circle-xmark"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value" id="stat-rejected-sellers">—</h3>
                                </div>
                                <p class="stat-footnote">Status: rejected</p>
                            </div>
                        </div>

                        <div class="stat-card stat-card-warning">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title" style="color:var(--warning);">Pending review</span>
                                    <div class="stat-icon icon-amber"><i class="fa-solid fa-clock"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value" id="stat-pending-kyc">—</h3>
                                </div>
                                <p class="stat-footnote">Status: pending review</p>
                            </div>
                        </div>
                    </div>

                    <div class="charts-row">
                        <div class="card-glass">
                            <div class="card-header">
                                <div>
                                    <h2 class="card-title">Gross sales by month</h2>
                                </div>
                            </div>
                            <div class="chart-box"><canvas id="marketplaceChart"></canvas></div>
                        </div>

                        <div class="card-glass">
                            <h2 class="card-title" style="margin-bottom:0.75rem;">Seller applications by category</h2>
                            <div class="chart-box-sm"><canvas id="categoryChart"></canvas></div>
                        </div>
                    </div>

                    <div class="card-glass">
                        <h2 class="card-title" style="margin-bottom:1rem;">Pending seller applications</h2>
                        <div class="activity-list" id="dashboard-activity-list"></div>
                    </div>
                </section>

                   <!-- VIEW 2: SELLER KYC -->
               <jsp:include page="/WEB-INF/views/components/SellerKYC.jsp" />

                <!-- VIEW 3: HOMEPAGE CMS -->
               <jsp:include page="/WEB-INF/views/components/HomepageCMS.jsp" />

                <!-- VIEW 4: PRODUCT MODERATION -->
               <jsp:include page="/WEB-INF/views/components/ProductModeration.jsp" />

                <!-- VIEW 5: PAYOUTS -->
               <jsp:include page="/WEB-INF/views/components/Payout.jsp" />

                <!-- VIEW 6: SETTINGS -->
                <section id="view-settings" class="hidden">
                    <h1 style="font-size:1.5rem; font-weight:800; margin-bottom:1.5rem;">Marketplace Settings</h1>

                    <div class="card-glass form-stack" style="max-width:640px;">
                        <h2 class="card-title" style="font-size:0.95rem;">Platform Credentials &amp; Legal KYC Rules</h2>

                        <div class="form-group">
                            <label class="form-label">Marketplace Platform Name</label>
                            <input type="text" value="Aalmari Multi-Vendor Online" class="form-input">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Required KYC Documents for Sellers</label>
                            <div class="checklist-item"><input type="checkbox" checked disabled> Business Registration / Ward Certificate (Mandatory)</div>
                            <div class="checklist-item"><input type="checkbox" checked disabled> PAN / VAT Tax Document Card (Mandatory)</div>
                            <div class="checklist-item"><input type="checkbox" checked disabled> Proprietor Citizenship / ID Passport (Mandatory)</div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    </div>

    <!-- MODAL 1: SELLER KYC REVIEW -->
    <div id="modal-seller-kyc" class="modal-overlay">
        <div class="modal-container" style="max-width:900px;">
            <div class="modal-header">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div class="stat-icon icon-amber" style="width:44px; height:44px; font-size:1.1rem;"><i class="fa-solid fa-address-card"></i></div>
                    <div>
                        <h3 id="kyc-modal-store-name" style="font-size:1rem; font-weight:800;">Store Verification Request</h3>
                        <p id="kyc-modal-applicant" class="cell-muted">Applicant: Jane Doe • Submitted: Oct 2026</p>
                    </div>
                </div>
                <button onclick="closeKycModal()" class="icon-btn" style="border:none;"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-content-pad custom-scrollbar">
                <div class="modal-grid-2">
                    <div class="info-card">
                        <h4>Business Credentials</h4>
                        <div class="info-grid">
                            <div><span class="label">Proposed Store Name</span><span id="kyc-info-store" class="value">-</span></div>
                            <div><span class="label">Store Category</span><span id="kyc-info-category" class="value">-</span></div>
                            <div><span class="label">PAN / VAT Number</span><span id="kyc-info-pan" class="value mono">-</span></div>
                            <div><span class="label">Business Reg. No</span><span id="kyc-info-regno" class="value mono">-</span></div>
                        </div>
                    </div>

                    <div class="info-card">
                        <h4 style="color:var(--secondary);">Contact &amp; Payout Bank Details</h4>
                        <div class="info-grid">
                            <div><span class="label">Account Holder's Name</span><span id="kyc-info-user" class="value">-</span></div>
                            <div><span class="label">Phone Number</span><span id="kyc-info-phone" class="value">-</span></div>
                            <div><span class="label">Payout Bank</span><span id="kyc-info-bank" class="value">-</span></div>
                            <div><span class="label">Account Number</span><span id="kyc-info-acc" class="value mono">-</span></div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="doc-section-head">
                        <h4><i class="fa-solid fa-file-contract" style="color:var(--primary);"></i> KYC Document Verification Inspector</h4>
                        <small>Click image to view full scale</small>
                    </div>

                    <div class="doc-tabs">
                        <button onclick="switchKycDocTab('citizenship')" id="doc-tab-citizenship" class="doc-tab-btn active">1. Citizenship / Passport ID</button>
                        <button onclick="switchKycDocTab('regCert')" id="doc-tab-regCert" class="doc-tab-btn">2. Business Registration</button>
                        <button onclick="switchKycDocTab('taxClearance')" id="doc-tab-taxClearance" class="doc-tab-btn">3. Address Proof</button>
                    </div>

                    <div class="doc-viewer-box">
                        <img id="kyc-doc-img-preview" src="" alt="Document Preview" hidden>
                        <p id="kyc-doc-empty" class="doc-empty-state">No document uploaded.</p>
                        <div class="doc-actions">
                            <button id="view-full-size-btn" onclick="openDocLightbox()" class="btn btn-outline btn-sm" style="color:var(--ink-900); border-color:var(--line);" disabled>
                                <i class="fa-solid fa-magnifying-glass-plus"></i> View Full Size
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="justify-content:space-between;">
                <button onclick="openRejectReasonModal()" class="btn btn-outline" style="color:var(--danger); border-color:rgba(239,68,68,.3);">
                    <i class="fa-solid fa-ban"></i> Reject Application
                </button>

                <div style="display:flex; gap:0.75rem;">
                    <button onclick="closeKycModal()" class="btn btn-outline">Close Preview</button>
                    <button onclick="approveSellerKyc()" class="btn btn-success">
                        <i class="fa-solid fa-circle-check"></i> Approve &amp; Grant Seller Account
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL 2: REJECTION REASON -->
    <div id="modal-reject-reason" class="modal-overlay">
        <div class="modal-container" style="max-width:460px;">
            <div class="modal-header" style="background:var(--danger-bg);">
                <h3 style="font-size:0.9rem; font-weight:800; color:var(--danger); display:flex; align-items:center; gap:0.5rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Rejection Reason Notice
                </h3>
                <button onclick="closeRejectReasonModal()" class="icon-btn" style="border:none;"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form onsubmit="submitKycRejection(event)" class="modal-content-pad">
                <p class="cell-muted">Specify reason for rejecting seller application. This note will be sent directly to the user email.</p>

                <div class="form-group">
                    <label class="form-label">Preset Rejection Reasons</label>
                    <select id="reject-preset-select" onchange="applyPresetReason(this.value)" class="form-select">
                        <option value="">-- Select Standard Reason --</option>
                        <option value="Illegible Document: Business Registration or PAN photo is blurry/unreadable.">Illegible / Blurry Document Photos</option>
                        <option value="Invalid Tax / PAN Number: PAN details provided do not match government records.">Invalid Tax or PAN Credentials</option>
                        <option value="Store Name Conflict: Proposed store name is already registered by another vendor.">Store Name Already Taken</option>
                        <option value="Expired Documents: Business registration or tax clearance has expired.">Expired Legal Certificates</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Detailed Explanation Note *</label>
                    <textarea id="reject-custom-note" required rows="3" placeholder="Explain why application was rejected..." class="form-textarea"></textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                    <button type="button" onclick="closeRejectReasonModal()" class="btn btn-outline">Cancel</button>
                    <button type="submit" class="btn btn-danger">Confirm Rejection</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL 3: HERO SLIDE ADD/EDIT -->
    <div id="modal-hero-slide" class="modal-overlay">
        <div class="modal-container" style="max-width:520px;">
            <div class="modal-header">
                <h3 id="modal-slide-header" style="font-size:0.9rem; font-weight:800;">Add Homepage Hero Slide</h3>
                <button onclick="closeSlideModal()" class="icon-btn" style="border:none;"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form id="slide-form" onsubmit="handleSlideSubmit(event)" class="modal-content-pad">
                <input type="hidden" id="slide-id">

                <div class="form-group">
                    <label class="form-label">Banner Headline Title *</label>
                    <input type="text" id="slide-title" required placeholder="e.g. Dashain Festival Mega Clearance" class="form-input">
                </div>

                <div class="form-row-2">
                    <div class="form-group">
                        <label class="form-label">Subtitle Tagline</label>
                        <input type="text" id="slide-subtitle" placeholder="UP TO 60% OFF" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CTA Button Text</label>
                        <input type="text" id="slide-cta" value="Shop Deal Now" class="form-input">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Target Route / Category Link</label>
                    <input type="text" id="slide-route" placeholder="aalmari.com/category/fashion" class="form-input">
                </div>

                <div class="form-group">
                    <label class="form-label">Image URL *</label>
                    <input type="url" id="slide-image" required placeholder="https://images.unsplash.com/photo-..." class="form-input">
                </div>

                <div class="form-row-2">
                    <div class="form-group">
                        <label class="form-label">Priority Order</label>
                        <input type="number" id="slide-priority" value="1" min="1" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Active Status</label>
                        <select id="slide-active" class="form-select">
                            <option value="true">Active (Published)</option>
                            <option value="false">Inactive (Draft)</option>
                        </select>
                    </div>
                </div>

                <div style="padding-top:0.5rem; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:0.75rem;">
                    <button type="button" onclick="closeSlideModal()" class="btn btn-outline">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Slide Banner</button>
                </div>
            </form>
        </div>
    </div>

    <!-- LIGHTBOX -->
    <div id="modal-lightbox" class="lightbox-overlay" style="display:none;">
        <button onclick="closeDocLightbox()" class="lightbox-close"><i class="fa-solid fa-xmark"></i></button>
        <img id="lightbox-img" src="" alt="Full document">
    </div>

    <!-- JAVASCRIPT APP LOGIC -->
<script src="/js/AdminPage.js?v=20261125-1740"></script>
</body>
</html>