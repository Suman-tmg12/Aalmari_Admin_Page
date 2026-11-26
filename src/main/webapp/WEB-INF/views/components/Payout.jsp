 <!-- VIEW 5: PAYOUTS -->
                <section id="view-payouts" class="hidden">
                    <div class="page-header">
                        <div>
                            <h1>Vendor Payouts &amp; Commission Rates</h1>
                            <p>Review seller earnings, platform commission, and payout status.</p>
                        </div>
                    </div>

                    <div class="payout-page-layout">
                        <section class="card-glass commission-settings-card" aria-labelledby="commission-settings-title">
                            <div class="commission-settings-copy">
                                <span class="commission-settings-icon" aria-hidden="true">
                                    <i class="fa-solid fa-percent"></i>
                                </span>
                                <div>
                                    <h2 class="card-title" id="commission-settings-title">Commission settings</h2>
                                    <p>Set the platform rate used to calculate seller commissions.</p>
                                </div>
                            </div>
                            <div class="commission-settings-controls">
                                <div class="commission-rate-field">
                                    <label class="form-label" for="commission-percent">Platform commission</label>
                                    <div class="commission-rate-input">
                                        <input type="number" id="commission-percent" min="0" max="100" step="0.01" value="10" class="form-input">
                                        <span aria-hidden="true">%</span>
                                    </div>
                                </div>
                                <button type="button" id="save-commission-btn" class="btn btn-primary">
                                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                                    Save rate
                                </button>
                            </div>
                        </section>

                        <section class="card-glass payout-queue-card" aria-labelledby="payout-queue-title">
                            <div class="payout-queue-header">
                                <div>
                                    <h2 class="card-title" id="payout-queue-title">Seller payout queue</h2>
                                    <p>Seller earnings and settlement status for the selected period.</p>
                                </div>
                                <span class="payout-period-badge" id="payout-period">Loading…</span>
                            </div>
                            <div class="table-responsive payout-table-responsive">
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
                        </section>
                    </div>
                </section>