
package com.isadiforcci.remessa.controller;

import com.isadiforcci.remessa.service.PdfRemessaService;
import com.isadiforcci.remessa.service.InterpretadorRemessaService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/remessas/pdf")
public class PdfRemessaController {

    private final PdfRemessaService pdfService;
    private final InterpretadorRemessaService interpretador;

    public PdfRemessaController(
            PdfRemessaService pdfService,
            InterpretadorRemessaService interpretador) {

        this.pdfService = pdfService;
        this.interpretador = interpretador;
    }

    @PostMapping(
        value = "/ler",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> lerPdf(
            @RequestParam("arquivo") MultipartFile arquivo) {

        try {
            String texto = pdfService.extrairTexto(arquivo);

            return ResponseEntity.ok(Map.of(
                "texto", texto,
                "codigosEncontrados",
                interpretador.extrairCodigos(texto),
                "itensEncontrados",
                interpretador.extrairItens(texto)
            ));

        } catch (IllegalArgumentException erro) {
            return ResponseEntity.badRequest()
                .body(Map.of("erro", erro.getMessage()));

        } catch (IOException erro) {
            return ResponseEntity.badRequest()
                .body(Map.of("erro", "Não foi possível ler o PDF."));
        }
    }
}
