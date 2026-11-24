 <!-- VIEW 5: PAYOUTS -->
                <section id="view-payouts" class="hidden">
                    <div class="page-header">
                        <div>
                            <h1>Vendor Payouts &amp; Commission Rates</h1>
                            <p>Payout and commission records are not available from the backend.</p>
                        </div>
                    </div>

                    <div class="cms-layout">
                        <div class="card-glass form-stack">
                            <h2 class="card-title" style="font-size:0.95rem;">Commission settings</h2>
                            <div class="form-group">
                                <label class="form-label" for="commission-percent">Platform commission (%)</label>
                                <input type="number" id="commission-percent" min="0" max="100" step="0.01" value="10" class="form-input">
                            </div>
                            <button type="button" id="save-commission-btn" class="btn btn-primary">Save commission</button>
                        </div>

                        <div class="card-glass" style="padding:0; display:flex; flex-direction:column;">
                            <div style="padding:1.25rem; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;">
                                <h2 class="card-title" style="font-size:0.95rem;">Seller Payout Queue</h2>
                                <span class="cell-muted" id="payout-period">Loading…</span>
                            </div>
                            <div class="table-responsive">
                                <table class="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Store Name</th>
                                            <th>Gross Sales</th>
                                            <th>Commission</th>
                                            <th>Net Payout</th>
                                            <th>Bank Details</th>
                                            <th>Status</th>
                                            <th class="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="payouts-tbody">
                                        <tr><td colspan="7" class="seller-data-message">Loading payout records…</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>