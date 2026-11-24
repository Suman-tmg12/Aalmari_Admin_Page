package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.model.CommissionSetting;
import com.example.aalmariadminportal.model.PayoutSettlement;
import com.example.aalmariadminportal.repository.CommissionSettingRepository;
import com.example.aalmariadminportal.repository.PayoutSettlementRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PayoutService {

    private final JdbcTemplate jdbcTemplate;
    private final CommissionSettingRepository commissionRepository;
    private final PayoutSettlementRepository payoutRepository;

    public PayoutService(JdbcTemplate jdbcTemplate,
                         CommissionSettingRepository commissionRepository,
                         PayoutSettlementRepository payoutRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.commissionRepository = commissionRepository;
        this.payoutRepository = payoutRepository;
    }

    public Map<String, Object> getPayoutData() {
        YearMonth period = latestDeliveredPeriod();
        if (period == null) {
            period = YearMonth.now().minusMonths(1);
        }
        double commissionPercent = getCommissionPercent();

        LocalDateTime periodStart = period.atDay(1).atStartOfDay();
        LocalDateTime periodEnd = period.plusMonths(1).atDay(1).atStartOfDay();

        String sql = """
            SELECT oi.seller_id,
                   COALESCE(SUM(oi.line_total), 0) AS gross_amount
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.status = 'DELIVERED'
              AND oi.seller_id IS NOT NULL
              AND COALESCE(oi.delivered_at, o.created_at) >= ?
              AND COALESCE(oi.delivered_at, o.created_at) < ?
            GROUP BY oi.seller_id
            HAVING COALESCE(SUM(oi.line_total), 0) > 0
            """;

        List<Map<String, Object>> earnings = jdbcTemplate.queryForList(sql, periodStart, periodEnd);
        List<Map<String, Object>> queue = new ArrayList<>();

        for (Map<String, Object> earning : earnings) {
            long sellerId = ((Number) earning.get("seller_id")).longValue();
            long gross = ((Number) earning.get("gross_amount")).longValue();

            Map<String, Object> seller = sellerDetails(sellerId);
            long commission = Math.round(gross * commissionPercent / 100.0);
            long net = gross - commission;

            String periodName = period.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            PayoutSettlement existing = payoutRepository
                    .findBySellerIdAndPeriod(sellerId, periodName).orElse(null);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("sellerId", sellerId);
            row.put("storeName", seller.get("storeName"));
            row.put("accountHolder", seller.get("accountHolder"));
            row.put("bankName", seller.get("bankName"));
            row.put("accountIban", seller.get("accountIban"));
            row.put("grossAmount", gross);
            row.put("commissionPercent", commissionPercent);
            row.put("commissionAmount", commission);
            row.put("netAmount", net);
            row.put("period", periodName);
            row.put("status", existing == null ? "PENDING" : existing.getStatus());
            row.put("settlementId", existing == null ? null : existing.getId());
            row.put("reference", existing == null ? null : existing.getReference());
            row.put("settledAt", existing == null ? null : existing.getSettledAt());
            queue.add(row);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period", period.format(DateTimeFormatter.ofPattern("MMMM yyyy")));
        result.put("periodCode", period.format(DateTimeFormatter.ofPattern("yyyy-MM")));
        result.put("commissionPercent", commissionPercent);
        result.put("queue", queue);
        return result;
    }

    private YearMonth latestDeliveredPeriod() {
        String sql = """
            SELECT COALESCE(oi.delivered_at, o.created_at) AS payout_date
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.status = 'DELIVERED'
              AND oi.seller_id IS NOT NULL
              AND COALESCE(oi.delivered_at, o.created_at) IS NOT NULL
            ORDER BY COALESCE(oi.delivered_at, o.created_at) DESC
            LIMIT 1
            """;

        try {
            java.sql.Timestamp timestamp = jdbcTemplate.queryForObject(sql, java.sql.Timestamp.class);
            if (timestamp == null) return null;
            return YearMonth.from(timestamp.toLocalDateTime());
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public double getCommissionPercent() {
        return commissionRepository.findBySettingKey("platform")
                .map(CommissionSetting::getCommissionPercent)
                .orElse(10.0);
    }

    @Transactional
    public Map<String, Object> updateCommission(double commissionPercent) {
        if (commissionPercent < 0 || commissionPercent > 100) {
            throw new IllegalArgumentException("Commission must be between 0 and 100 percent.");
        }

        CommissionSetting setting = commissionRepository.findBySettingKey("platform")
                .orElseGet(CommissionSetting::new);
        setting.setSettingKey("platform");
        setting.setCommissionPercent(commissionPercent);
        commissionRepository.save(setting);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("commissionPercent", commissionPercent);
        return result;
    }

    @Transactional
    public Map<String, Object> settlePayout(long sellerId, String period, String reference) {
        if (reference == null) reference = "";

        YearMonth selectedPeriod;
        try {
            selectedPeriod = YearMonth.parse(period);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid payout period.");
        }

        double commissionPercent = getCommissionPercent();
        LocalDateTime start = selectedPeriod.atDay(1).atStartOfDay();
        LocalDateTime end = selectedPeriod.plusMonths(1).atDay(1).atStartOfDay();

        String sql = """
            SELECT COALESCE(SUM(oi.line_total), 0) AS gross_amount
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.status = 'DELIVERED'
              AND oi.seller_id = ?
              AND COALESCE(oi.delivered_at, o.created_at) >= ?
              AND COALESCE(oi.delivered_at, o.created_at) < ?
            """;
        Number grossValue = jdbcTemplate.queryForObject(sql, Number.class, sellerId, start, end);
        long gross = grossValue == null ? 0 : grossValue.longValue();
        if (gross <= 0) throw new IllegalArgumentException("No delivered earnings found for this payout period.");

        long commission = Math.round(gross * commissionPercent / 100.0);
        long net = gross - commission;

        PayoutSettlement settlement = payoutRepository
                .findBySellerIdAndPeriod(sellerId, period)
                .orElseGet(PayoutSettlement::new);
        settlement.setSellerId(sellerId);
        settlement.setPeriod(period);
        settlement.setGrossAmount(gross);
        settlement.setCommissionPercent(commissionPercent);
        settlement.setCommissionAmount(commission);
        settlement.setNetAmount(net);
        settlement.setStatus("PAID");
        settlement.setSettledAt(LocalDateTime.now());
        settlement.setReference(reference.trim());
        payoutRepository.save(settlement);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("status", "PAID");
        result.put("netAmount", net);
        result.put("reference", settlement.getReference());
        return result;
    }

    private Map<String, Object> sellerDetails(long sellerId) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("storeName", "Seller #" + sellerId);
        result.put("accountHolder", "");
        result.put("bankName", "");
        result.put("accountIban", "");

        String sql = "SELECT store_name, account_holder, bank_name, account_iban "
                + "FROM seller_documentation WHERE user_id = ? LIMIT 1";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, sellerId);
        if (!rows.isEmpty()) {
            Map<String, Object> row = rows.get(0);
            result.put("storeName", row.get("store_name") == null ? "Seller #" + sellerId : row.get("store_name"));
            result.put("accountHolder", row.get("account_holder") == null ? "" : row.get("account_holder"));
            result.put("bankName", row.get("bank_name") == null ? "" : row.get("bank_name"));
            result.put("account_iban", row.get("account_iban") == null ? "" : row.get("account_iban"));
        }
        return result;
    }
}

