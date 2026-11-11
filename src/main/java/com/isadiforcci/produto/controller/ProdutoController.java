package com.isadiforcci.produto.controller;

import com.isadiforcci.produto.model.Produto;
import com.isadiforcci.produto.service.ProdutoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Produto> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        Produto produto = service.buscarPorId(id);
        return produto == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(produto);
    }

    @PostMapping
    public Produto salvar(@RequestBody Produto produto) {
        produto.setId(null);
        return service.salvar(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> editar(
            @PathVariable Long id,
            @RequestBody Produto dados) {

        Produto existente = service.buscarPorId(id);

        if (existente == null) {
            return ResponseEntity.notFound().build();
        }

        existente.setNome(dados.getNome());
        existente.setUnidade(dados.getUnidade());
        existente.setNcm(dados.getNcm());

        // Mantém remessa e quantidade originais.
        return ResponseEntity.ok(service.salvar(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}