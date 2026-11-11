
package com.isadiforcci.remessa.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PdfRemessaService {

    public String extrairTexto(MultipartFile arquivo) throws IOException {

        if (arquivo.isEmpty()) {
            throw new IllegalArgumentException("O arquivo está vazio.");
        }

        if (arquivo.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException(
                "O PDF não pode ultrapassar 10 MB."
            );
        }

        try (PDDocument documento =
                 Loader.loadPDF(arquivo.getBytes())) {

            PDFTextStripper leitor = new PDFTextStripper();

            leitor.setSortByPosition(true);

            return leitor.getText(documento);
        }
    }
}
