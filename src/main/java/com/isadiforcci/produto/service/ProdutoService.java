package com.isadiforcci.produto.service;

import com.isadiforcci.produto.model.Produto;
import com.isadiforcci.produto.repository.ProdutoRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository repository;
    private final JdbcTemplate jdbcTemplate;

    public ProdutoService(
            ProdutoRepository repository,
            JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Produto> listarTodos() {
        return repository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Produto salvar(Produto produto) {
        return repository.save(produto);
    }

    @Transactional
    public void excluir(Long id) {

        Produto produto = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Produto não encontrado."
                ));

        if (produto.getRemessa() != null
                && !produto.getRemessa().isBlank()) {
            bloquearExclusao();
        }

        if (produto.getQuantidade() != null
                && produto.getQuantidade().compareTo(BigDecimal.ZERO) != 0) {
            bloquearExclusao();
        }

        Long totalRemessas = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM itens_remessa WHERE produto_id = ?",
                Long.class,
                id
        );

        Long totalDevolucoes = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM itens_devolucao WHERE produto_id = ?",
                Long.class,
                id
        );

        if ((totalRemessas != null && totalRemessas > 0)
                || (totalDevolucoes != null && totalDevolucoes > 0)) {
            bloquearExclusao();
        }

        try {
            repository.delete(produto);
            repository.flush();
        } catch (DataIntegrityViolationException erro) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este produto possui registros relacionados e não pode ser excluído."
            );
        }
    }

    private void bloquearExclusao() {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Este produto possui remessa, quantidade ou histórico vinculado e não pode ser excluído."
        );
    }
}