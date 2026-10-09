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