package com.isadiforcci.remessa.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RemessaService {

    private final JdbcTemplate jdbcTemplate;

    public RemessaService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> listarRemessas() {
        String sql = """
            SELECT
                id,
                numero,
                data_recebimento,
                origem,
                observacoes,
                status
            FROM remessas
            ORDER BY data_recebimento DESC, id DESC
            """;

        return jdbcTemplate.queryForList(sql);
    }
}