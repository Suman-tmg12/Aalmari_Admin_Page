<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" isELIgnored="true" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aalmari Multi-Vendor Marketplace - Admin Portal</title>
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Design System Stylesheet (replaces Tailwind) -->
    <link rel="stylesheet" href="<%= request.getContextPath() %>/css/AdminPage.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

        /* ============ Page-specific additions not covered by AdminPagesdfds.css ============ */
        .hidden { display: none !important; }

        /* Page header row */
        .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; }
        .page-header p { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem; }

        /* Buttons extras */
        .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
        .btn-warning { background-color: var(--warning); color: #fff; }
        .btn-warning:hover { opacity: 0.9; }

        /* Stat card icon boxes */
        .stat-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .stat-icon.icon-indigo { background: rgba(99,102,241,.12); color: var(--primary); }
        .stat-icon.icon-emerald { background: var(--success-bg); color: var(--success); }
        .stat-icon.icon-purple { background: rgba(139,92,246,.12); color: var(--secondary); }
        .stat-icon.icon-amber { background: var(--warning-bg); color: var(--warning); }
        .stat-card-row-top { display: flex; align-items: center; justify-content: space-between; }
        .stat-value-row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 0.75rem; }
        .stat-footnote { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem; }
        .stat-card-warning { border-color: rgba(245,158,11,.4); }

        /* Charts row */
        .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .chart-box { height: 260px; width: 100%; }
        .chart-box-sm { height: 210px; width: 100%; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 1024px) { .charts-row { grid-template-columns: 1fr; } }

        /* Activity list */
        .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .activity-item { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem; border-radius: var(--radius-md); background: var(--warning-bg); border: 1px solid rgba(245,158,11,.25); flex-wrap: wrap; }
        .activity-left { display: flex; align-items: center; gap: 0.85rem; }
        .activity-icon { width: 34px; height: 34px; border-radius: 10px; background: var(--warning); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; }
        .activity-title { font-size: 0.8rem; font-weight: 700; }
        .activity-sub { font-size: 0.72rem; color: var(--text-muted); }
        .activity-link { font-size: 0.78rem; font-weight: 700; color: var(--warning); text-decoration: none; }
        .empty-note { font-size: 0.8rem; color: var(--text-muted); }

        /* Toolbar: filter tabs + search */
        .toolbar { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .filter-tabs { display: flex; gap: 0.5rem; overflow-x: auto; flex: 1; }
        .tab-btn { padding: 0.5rem 0.9rem; border-radius: var(--radius-md); font-size: 0.78rem; font-weight: 700; white-space: nowrap; border: none; background: var(--bg-input); color: var(--text-muted); cursor: pointer; transition: var(--transition); }
        .tab-btn.active { background: var(--warning); color: #fff; }
        .tab-btn:hover:not(.active) { background: var(--border-color); }

        /* CMS layout */
        .cms-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; }
        @media (max-width: 1024px) { .cms-layout { grid-template-columns: 1fr; } }

        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); margin-bottom: 0.75rem; }
        .toggle-row:last-child { margin-bottom: 0; }
        .toggle-row h4 { font-size: 0.78rem; font-weight: 700; }
        .toggle-row p { font-size: 0.7rem; color: var(--text-muted); }

        .slide-priority-badge { font-size: 0.65rem; font-weight: 800; padding: 0.1rem 0.4rem; border-radius: 5px; background: var(--border-color); color: var(--text-main); }
        .slide-meta { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.2rem; }
        .slide-actions { display: flex; align-items: center; gap: 0.3rem; }
        .icon-action-btn { width: 30px; height: 30px; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: var(--transition); }
        .icon-action-btn:hover { background: var(--bg-input); color: var(--primary); }
        .icon-action-btn.on { color: var(--success); background: var(--success-bg); }

        /* Mock phone preview */
        .mock-phone { width: 100%; max-width: 320px; margin: 0 auto; background: #0b1120; color: #fff; border-radius: 28px; padding: 1rem; box-shadow: var(--shadow-lg); border: 4px solid #1e293b; }
        .mock-phone-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.7rem; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 0.65rem; color: #94a3b8; }
        .mock-live-pill { background: rgba(16,185,129,.2); color: #34d399; padding: 0.1rem 0.5rem; border-radius: 20px; font-weight: 700; }
        .mock-slide-frame { margin-top: 0.75rem; position: relative; border-radius: 18px; overflow: hidden; height: 210px; background: #1e293b; }
        .mock-slide-frame img { width: 100%; height: 100%; object-fit: cover; }
        .mock-slide-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(2,6,23,.95), rgba(2,6,23,.4) 60%, transparent); padding: 1rem; display: flex; flex-direction: column; justify-content: flex-end; }
        .mock-slide-overlay .tag { font-size: 0.6rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; color: #fbbf24; }
        .mock-slide-overlay h3 { font-size: 0.95rem; font-weight: 800; margin-top: 0.2rem; }
        .mock-cta-row { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; }
        .mock-cta-btn { background: var(--primary); color: #fff; padding: 0.3rem 0.7rem; border-radius: 8px; font-size: 0.65rem; font-weight: 700; border: none; }
        .mock-route { font-size: 0.6rem; color: #cbd5e1; }
        .mock-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem; }
        .mock-nav-btn.left { left: 8px; } .mock-nav-btn.right { right: 8px; }
        .mock-dots { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; }
        .mock-dot { width: 6px; height: 6px; border-radius: 3px; background: rgba(255,255,255,.4); transition: var(--transition); }
        .mock-dot.active { width: 14px; background: #fff; }
        .mock-categories-title { display: flex; align-items: center; justify-content: space-between; color: #fff; font-weight: 700; font-size: 0.8rem; margin-top: 1rem; }
        .mock-categories-title span:last-child { color: #818cf8; font-size: 0.65rem; font-weight: 500; }
        .mock-categories-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; margin-top: 0.5rem; }
        .mock-cat-item { background: #1e293b; padding: 0.4rem; border-radius: 10px; text-align: center; font-size: 0.6rem; color: #cbd5e1; }

        /* KYC Modal info cards */
        .modal-content-pad { padding: 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
        .modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 640px) { .modal-grid-2 { grid-template-columns: 1fr; } }
        .info-card { background: var(--bg-input); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
        .info-card h4 { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--primary); margin-bottom: 0.6rem; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; font-size: 0.78rem; }
        .info-grid .label { display: block; font-size: 0.65rem; color: var(--text-muted); }
        .info-grid .value { font-weight: 700; }
        .info-grid .mono { font-family: 'SFMono-Regular', Consolas, monospace; }

        /* Document viewer */
        .doc-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
        .doc-section-head h4 { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .doc-section-head small { font-size: 0.68rem; color: var(--text-muted); }
        .doc-tabs { display: flex; gap: 0.4rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem; flex-wrap: wrap; }
        .doc-tab-btn { padding: 0.4rem 0.75rem; border-radius: var(--radius-md); font-size: 0.72rem; font-weight: 700; background: transparent; color: var(--text-muted); border: none; cursor: pointer; }
        .doc-tab-btn.active { background: var(--primary); color: #fff; }
        .doc-viewer-box { margin-top: 1rem; background: #0f172a; border-radius: var(--radius-lg); padding: 1.25rem; display: flex; flex-direction: column; align-items: center; min-height: 220px; }
        .doc-viewer-box img { max-height: 260px; object-fit: contain; border-radius: var(--radius-md); box-shadow: var(--shadow-md); }
        .doc-actions { margin-top: 0.9rem; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
        .doc-verified-pill { font-size: 0.68rem; color: #34d399; background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.3); padding: 0.3rem 0.6rem; border-radius: var(--radius-md); font-weight: 700; }

        /* Generic form controls (used by modals & settings) */
        .form-group { margin-bottom: 0; }
        .form-label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem; }
        .form-input, .form-select, .form-textarea {
            width: 100%; padding: 0.6rem 0.8rem; font-size: 0.8rem; background: var(--bg-input);
            border: 1px solid transparent; border-radius: var(--radius-md); color: var(--text-main); outline: none; transition: var(--transition);
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--primary); background: var(--bg-card); box-shadow: 0 0 0 3px var(--primary-light); }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .form-stack { display: flex; flex-direction: column; gap: 1rem; }
        .input-with-btn { display: flex; gap: 0.5rem; }

        .checklist-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 500; padding-top: 0.3rem; }

        .notice-box { padding: 0.9rem; border-radius: var(--radius-md); background: var(--primary-light); border: 1px solid rgba(99,102,241,.25); font-size: 0.78rem; }
        .notice-box p.title { font-weight: 700; display: flex; align-items: center; gap: 0.4rem; }
        .notice-box p.body { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.3rem; }

        /* Feature toggle button for products */
        .feature-toggle { border: none; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.68rem; font-weight: 700; cursor: pointer; background: var(--bg-input); color: var(--text-muted); }
        .feature-toggle.active { background: rgba(139,92,246,.15); color: var(--secondary); }

        /* Toasts */
        #toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 1200; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast {
            pointer-events: auto; display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1.1rem;
            border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-size: 0.78rem; font-weight: 700;
            background: var(--bg-sidebar); color: #fff; transform: translateY(20px); opacity: 0; transition: all .3s ease;
        }
        .toast.show { transform: translateY(0); opacity: 1; }
        .toast i { font-size: 1rem; }
        .toast-success i { color: var(--success); }
        .toast-danger i { color: var(--danger); }
        .toast-info i { color: var(--info); }

        /* Lightbox */
        .lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.9); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1300; padding: 1rem; }
        .lightbox-overlay img { max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
        .lightbox-close { position: absolute; top: 1.25rem; right: 1.25rem; color: #fff; font-size: 1.5rem; background: none; border: none; cursor: pointer; }

        /* Sidebar quick link card */
        .sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,.08); }
        .quick-link-card { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-radius: var(--radius-md); background: rgba(99,102,241,.12); color: #c7d2fe; text-decoration: none; font-size: 0.75rem; font-weight: 600; }
        .quick-link-card:hover { background: rgba(99,102,241,.2); }

        /* Table action cell alignment */
        .text-right { text-align: right; }
        .cell-strong { font-weight: 800; }
        .cell-muted { color: var(--text-muted); font-size: 0.72rem; }
    </style>
</head>
<body>

    <!-- Toast Notification Container -->
    <div id="toast-container"></div>

    <div class="admin-wrapper">

        <!-- Sidebar -->
        <aside id="sidebar" class="sidebar">
            <div class="sidebar-header">
                <div class="brand-logo">
                    <i class="fa-solid fa-store"></i>
                    AAL<span>MARI</span>
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
                        <span id="nav-pending-kyc-badge" class="nav-badge">3</span>
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
                        <span class="nav-badge" id="sidebar-product-count">0</span>
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
                    <button id="theme-toggle" class="icon-btn" title="Toggle Theme">
                        <i class="fa-solid fa-moon" id="icon-moon"></i>
                        <i class="fa-solid fa-sun" id="icon-sun" style="display:none;"></i>
                    </button>

                    <button id="notif-btn" class="icon-btn">
                        <i class="fa-regular fa-bell"></i>
                        <span class="notification-dot"></span>
                    </button>

                    <div class="user-profile">
                        <img class="avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&amp;auto=format&amp;fit=crop&amp;q=80" alt="Super Admin">
                        <div class="user-info">
                            <h4>Super Admin</h4>
                            <p>Aalmari Operations</p>
                        </div>
                    </div>
                </div>
            </header>

            <main class="page-container custom-scrollbar" style="overflow-y:auto;">

                <!-- VIEW 1: DASHBOARD -->
                <section id="view-dashboard">
                    <div class="page-header">
                        <div>
                            <h1>Marketplace Control Center</h1>
                            <p>Monitor vendor performance, overall GMV, commission earnings, and KYC verification queues.</p>
                        </div>
                        <button onclick="switchView('seller-kyc')" class="btn btn-warning">
                            <i class="fa-solid fa-user-check"></i> Review Sellers (<span id="dash-kyc-count">3</span>)
                        </button>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title">Gross Sales (GMV)</span>
                                    <div class="stat-icon icon-indigo"><i class="fa-solid fa-money-bill-trend-up"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value">NPR 1,84,500</h3>
                                    <span class="stat-trend positive"><i class="fa-solid fa-arrow-trend-up"></i> +18.4%</span>
                                </div>
                                <p class="stat-footnote">Across 48 active vendor storefronts</p>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title">Aalmari Commission</span>
                                    <div class="stat-icon icon-emerald"><i class="fa-solid fa-coins"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value">NPR 18,450</h3>
                                    <span class="stat-trend positive">10% Avg Rate</span>
                                </div>
                                <p class="stat-footnote">Net platform service revenue</p>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title">Approved Sellers</span>
                                    <div class="stat-icon icon-purple"><i class="fa-solid fa-store"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value" id="stat-approved-sellers">48</h3>
                                    <span class="stat-trend positive">Active</span>
                                </div>
                                <p class="stat-footnote">12 seller applications rejected</p>
                            </div>
                        </div>

                        <div class="stat-card stat-card-warning">
                            <div style="width:100%;">
                                <div class="stat-card-row-top">
                                    <span class="stat-title" style="color:var(--warning);">Pending KYC Queue</span>
                                    <div class="stat-icon icon-amber"><i class="fa-solid fa-id-card"></i></div>
                                </div>
                                <div class="stat-value-row">
                                    <h3 class="stat-value" id="stat-pending-kyc">3</h3>
                                    <span class="stat-trend" style="color:var(--warning); background:var(--warning-bg);">Requires Action</span>
                                </div>
                                <p class="stat-footnote">Submitted documents waiting review</p>
                            </div>
                        </div>
                    </div>

                    <div class="charts-row">
                        <div class="card-glass">
                            <div class="card-header">
                                <div>
                                    <h2 class="card-title">Platform Revenue &amp; Vendor GMV</h2>
                                    <p class="cell-muted">Monthly breakdown of gross merchandise volume vs platform fee earnings</p>
                                </div>
                            </div>
                            <div class="chart-box"><canvas id="marketplaceChart"></canvas></div>
                        </div>

                        <div class="card-glass">
                            <h2 class="card-title" style="margin-bottom:0.2rem;">Top Vendor Categories</h2>
                            <p class="cell-muted" style="margin-bottom:0.75rem;">Distribution of active sellers across marketplace departments</p>
                            <div class="chart-box-sm"><canvas id="categoryChart"></canvas></div>
                        </div>
                    </div>

                    <div class="card-glass">
                        <h2 class="card-title" style="margin-bottom:1rem;">Recent Seller Registrations &amp; Status Events</h2>
                        <div class="activity-list" id="dashboard-activity-list"></div>
                    </div>
                </section>

                <!-- VIEW 2: SELLER KYC -->
                <section id="view-seller-kyc" class="hidden">
                    <div class="page-header">
                        <div>
                            <h1>Seller KYC Approvals</h1>
                            <p>Verify business registration, PAN/Tax cards, and citizenship credentials before granting Seller rights.</p>
                        </div>
                    </div>

                    <div class="toolbar">
                        <div class="filter-tabs">
                            <button onclick="filterSellerStatus('Pending')" id="tab-kyc-pending" class="tab-btn active">Pending Review (<span id="count-pending-tab">3</span>)</button>
                            <button onclick="filterSellerStatus('Approved')" id="tab-kyc-approved" class="tab-btn">Approved Sellers (<span id="count-approved-tab">48</span>)</button>
                            <button onclick="filterSellerStatus('Rejected')" id="tab-kyc-rejected" class="tab-btn">Rejected (<span id="count-rejected-tab">12</span>)</button>
                            <button onclick="filterSellerStatus('ALL')" id="tab-kyc-all" class="tab-btn">All Applications</button>
                        </div>

                        <div class="search-box">
                            <i class="fa-solid fa-magnifying-glass search-icon"></i>
                            <input type="text" id="seller-kyc-search" placeholder="Search store, user name, or PAN ID...">
                        </div>
                    </div>

                    <div class="card-glass" style="padding:0;">
                        <div class="table-responsive">
                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>Proposed Store</th>
                                        <th>Applicant / User</th>
                                        <th>PAN / Reg No.</th>
                                        <th>Category</th>
                                        <th>Applied Date</th>
                                        <th>Status</th>
                                        <th class="text-right">KYC Action</th>
                                    </tr>
                                </thead>
                                <tbody id="sellers-kyc-tbody"></tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <!-- VIEW 3: HOMEPAGE CMS -->
                <section id="view-homepage-cms" class="hidden">
                    <div class="page-header">
                        <div>
                            <h1>Aalmari Homepage CMS</h1>
                            <p>Manage storefront promotional banners, hero carousel slides, and featured layout sections.</p>
                        </div>
                        <button onclick="openAddSlideModal()" class="btn btn-primary">
                            <i class="fa-solid fa-plus"></i> Add New Hero Slide
                        </button>
                    </div>

                    <div class="cms-layout">
                        <div class="form-stack">
                            <div class="card-glass">
                                <div class="card-header">
                                    <div>
                                        <h2 class="card-title" style="font-size:0.95rem;">Active Hero Slider Banners</h2>
                                        <p class="cell-muted">Drag or re-order slides to update priority on live Aalmari website.</p>
                                    </div>
                                    <span class="badge badge-live" id="slide-count-badge">3 Slides Active</span>
                                </div>
                                <div id="hero-slides-list" class="slider-list"></div>
                            </div>

                            <div class="card-glass">
                                <h2 class="card-title" style="margin-bottom:1rem; font-size:0.95rem;">Storefront Layout Toggles</h2>

                                <div class="toggle-row">
                                    <div>
                                        <h4>Flash Sale Countdown Ticker</h4>
                                        <p>Display top notification banner for active sales</p>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" checked onchange="showToast('Flash Sale section visibility updated', 'info')">
                                        <span class="slider-toggle"></span>
                                    </label>
                                </div>

                                <div class="toggle-row">
                                    <div>
                                        <h4>Featured Seller Spotlights</h4>
                                        <p>Show top verified sellers on homepage body</p>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" checked onchange="showToast('Featured Sellers section visibility updated', 'info')">
                                        <span class="slider-toggle"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="mock-phone">
                                <div class="mock-phone-header">
                                    <span style="font-weight:700; color:#fff;"><i class="fa-solid fa-bag-shopping" style="color:var(--primary);"></i> AALMARI STOREFRONT</span>
                                    <span class="mock-live-pill">LIVE PREVIEW</span>
                                </div>

                                <div class="mock-slide-frame">
                                    <img id="mock-slide-img" src="" alt="Live Mockup Banner">
                                    <div class="mock-slide-overlay">
                                        <span class="tag" id="mock-slide-subtitle">PROMOTIONAL OFFER</span>
                                        <h3 id="mock-slide-title">Festive Season Sale</h3>
                                        <div class="mock-cta-row">
                                            <button class="mock-cta-btn" id="mock-slide-btn">Shop Now</button>
                                            <span class="mock-route" id="mock-slide-route">aalmari.com/category/festive</span>
                                        </div>
                                    </div>

                                    <button onclick="prevMockSlide()" class="mock-nav-btn left"><i class="fa-solid fa-chevron-left"></i></button>
                                    <button onclick="nextMockSlide()" class="mock-nav-btn right"><i class="fa-solid fa-chevron-right"></i></button>

                                    <div class="mock-dots" id="mock-slider-dots"></div>
                                </div>

                                <div class="mock-categories-title">
                                    <span>Categories</span>
                                    <span>View All</span>
                                </div>
                                <div class="mock-categories-grid">
                                    <div class="mock-cat-item">&#128085; Ethnic</div>
                                    <div class="mock-cat-item">&#128094; Footwear</div>
                                    <div class="mock-cat-item">&#128142; Jewelry</div>
                                    <div class="mock-cat-item">&#128241; Tech</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- VIEW 4: PRODUCT MODERATION -->
                <section id="view-product-moderation" class="hidden">
                    <div class="page-header">
                        <div>
                            <h1>Vendor Product Moderation</h1>
                            <p>Review vendor uploaded listings, approve products for marketplace publishing, or feature top listings.</p>
                        </div>
                    </div>

                    <div class="card-glass" style="padding:0;">
                        <div class="table-responsive">
                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>Product Title</th>
                                        <th>Seller Store</th>
                                        <th>Department</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Approval Status</th>
                                        <th class="text-right">Moderation Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="products-moderation-tbody"></tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <!-- VIEW 5: PAYOUTS -->
                <section id="view-payouts" class="hidden">
                    <div class="page-header">
                        <div>
                            <h1>Vendor Payouts &amp; Commission Rates</h1>
                            <p>Settle seller earnings, review bank details, and adjust platform marketplace commissions.</p>
                        </div>
                    </div>

                    <div class="cms-layout">
                        <div class="card-glass form-stack">
                            <h2 class="card-title" style="font-size:0.95rem;">Default Commission Settings</h2>

                            <div class="form-group">
                                <label class="form-label">Standard Marketplace Fee (%)</label>
                                <div class="input-with-btn">
                                    <input type="number" id="default-commission-rate" value="10" min="0" max="50" class="form-input">
                                    <button onclick="updateCommissionRate()" class="btn btn-primary btn-sm" style="white-space:nowrap;">Save Rate</button>
                                </div>
                            </div>

                            <div class="notice-box">
                                <p class="title"><i class="fa-solid fa-circle-info"></i> Commission Policy</p>
                                <p class="body">This default commission rate is automatically deducted from gross sales during payouts unless an individual seller override rate is set.</p>
                            </div>
                        </div>

                        <div class="card-glass" style="padding:0; display:flex; flex-direction:column;">
                            <div style="padding:1.25rem; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;">
                                <h2 class="card-title" style="font-size:0.95rem;">Seller Payout Queue</h2>
                                <span class="badge badge-pending">Settlement Pending</span>
                            </div>
                            <div class="table-responsive">
                                <table class="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Store Name</th>
                                            <th>Gross Sales</th>
                                            <th>Fee (10%)</th>
                                            <th>Net Payout</th>
                                            <th class="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="payouts-tbody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

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
                            <div><span class="label">Applicant Name</span><span id="kyc-info-user" class="value">-</span></div>
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
                        <button onclick="switchKycDocTab('taxClearance')" id="doc-tab-taxClearance" class="doc-tab-btn">3. PAN / Tax Clearance Card</button>
                    </div>

                    <div class="doc-viewer-box">
                        <img id="kyc-doc-img-preview" src="" alt="Document Preview">
                        <div class="doc-actions">
                            <button onclick="openDocLightbox()" class="btn btn-outline btn-sm" style="color:#fff; border-color:rgba(255,255,255,.3);">
                                <i class="fa-solid fa-magnifying-glass-plus"></i> View Full Size
                            </button>
                            <span class="doc-verified-pill"><i class="fa-solid fa-shield-check"></i> Watermark Verified</span>
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
    <script>
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

            document.getElementById('seller-kyc-search').addEventListener('input', renderKycSellerTable);
            document.getElementById('global-search').addEventListener('input', (e) => {
                const val = e.target.value;
                if (val.trim()) {
                    switchView('seller-kyc');
                    document.getElementById('seller-kyc-search').value = val;
                    renderKycSellerTable();
                }
            });

            document.getElementById('theme-toggle').addEventListener('click', () => {
                const html = document.documentElement;
                const isDark = html.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    html.removeAttribute('data-theme');
                    document.getElementById('icon-moon').style.display = 'inline';
                    document.getElementById('icon-sun').style.display = 'none';
                } else {
                    html.setAttribute('data-theme', 'dark');
                    document.getElementById('icon-moon').style.display = 'none';
                    document.getElementById('icon-sun').style.display = 'inline';
                }
            });

            document.getElementById('open-sidebar-btn').addEventListener('click', () => {
                document.getElementById('sidebar').classList.add('mobile-open');
            });
            document.getElementById('close-sidebar-btn').addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('mobile-open');
            });

            // Show mobile toggles only on small screens
            function syncMobileButtons() {
                const show = window.innerWidth <= 1024;
                document.getElementById('open-sidebar-btn').style.display = show ? 'flex' : 'none';
                document.getElementById('close-sidebar-btn').style.display = show ? 'flex' : 'none';
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

            document.getElementById('sidebar').classList.remove('mobile-open');
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
            const search = document.getElementById('seller-kyc-search').value.toLowerCase();

            const pendingCount = sellers.filter(s => s.status === 'Pending').length;
            const approvedCount = sellers.filter(s => s.status === 'Approved').length;
            const rejectedCount = sellers.filter(s => s.status === 'Rejected').length;

            document.getElementById('nav-pending-kyc-badge').innerText = pendingCount;
            document.getElementById('dash-kyc-count').innerText = pendingCount;
            document.getElementById('stat-pending-kyc').innerText = pendingCount;
            document.getElementById('stat-approved-sellers').innerText = approvedCount;

            document.getElementById('count-pending-tab').innerText = pendingCount;
            document.getElementById('count-approved-tab').innerText = approvedCount;
            document.getElementById('count-rejected-tab').innerText = rejectedCount;

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
            document.getElementById('slide-count-badge').innerText = `${heroSlides.filter(s => s.active).length} Slides Active`;

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

            document.getElementById('mock-slide-img').src = slide.imageUrl;
            document.getElementById('mock-slide-title').innerText = slide.title;
            document.getElementById('mock-slide-subtitle').innerText = slide.subtitle || "AALMARI FEATURED";
            document.getElementById('mock-slide-btn').innerText = slide.ctaText || "Shop Now";
            document.getElementById('mock-slide-route').innerText = slide.ctaUrl || "aalmari.com";

            const dotsContainer = document.getElementById('mock-slider-dots');
            dotsContainer.innerHTML = activeSlides.map((_, i) => `
                <span class="mock-dot ${i === mockSlideIndex ? 'active' : ''}"></span>
            `).join('');
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
            document.getElementById('sidebar-product-count').innerText = vendorProducts.length;

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
            const ctx1 = document.getElementById('marketplaceChart').getContext('2d');
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

            const ctx2 = document.getElementById('categoryChart').getContext('2d');
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
    </script>
</body>
</html>