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