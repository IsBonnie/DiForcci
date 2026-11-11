package com.isadiforcci.remessa.controller;

import com.isadiforcci.remessa.service.RemessaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/remessas")
public class RemessaController {

    private final RemessaService remessaService;

    public RemessaController(RemessaService remessaService) {
        this.remessaService = remessaService;
    }

    @GetMapping
    public List<Map<String, Object>> listarRemessas() {
        return remessaService.listarRemessas();
    }
}