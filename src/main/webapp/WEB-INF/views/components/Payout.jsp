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