package com.isadiforcci.estoque.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EstoqueService {

    private final JdbcTemplate jdbcTemplate;

    public EstoqueService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> listarEstoque() {

        String sql = """
            SELECT
                lote_id,
                numero_remessa,
                produto_id,
                codigo_fabrica,
                produto,
                numero_lote,
                data_validade,
                unidade,
                saldo_atual
            FROM vw_estoque_lotes
            ORDER BY produto, data_validade
            """;

        return jdbcTemplate.queryForList(sql);
    }
}