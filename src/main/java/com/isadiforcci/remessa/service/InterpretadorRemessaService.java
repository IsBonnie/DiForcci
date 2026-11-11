
package com.isadiforcci.remessa.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class InterpretadorRemessaService {

    // Campos fiscais de cada produto:
    // NCM, CST, CFOP, unidade e quantidade.
    private static final Pattern CAMPOS_FISCAIS = Pattern.compile(
        "\\b\\d{8}\\s+\\d{3}\\s+\\d{4}\\s+" +
        "(KG|UN)\\s+(\\d[\\d.]*,\\d{3})\\b"
    );

    // Código do produto no início da linha.
    private static final Pattern CODIGO_INICIO = Pattern.compile(
        "^\\s*(\\d{1,6})\\s+\\S+"
    );

    public List<String> extrairCodigos(String texto) {

        List<String> codigos = new ArrayList<>();

        for (Map<String, Object> item : extrairItens(texto)) {
            codigos.add((String) item.get("codigo"));
        }

        return codigos;
    }

    public List<Map<String, Object>> extrairItens(String texto) {

        List<Map<String, Object>> itens = new ArrayList<>();
        String[] linhas = texto.split("\\R");

        boolean dentroProdutos = false;

        for (int i = 0; i < linhas.length; i++) {

            String linha = linhas[i].trim();

            if (linha.contains("DADOS DO PRODUTO, SERVIÇOS")) {
                dentroProdutos = true;
                continue;
            }

            if (linha.contains("CÁLCULO DO ISSQN")
                    || linha.contains("DADOS ADICIONAIS")) {
                dentroProdutos = false;
                continue;
            }

            if (!dentroProdutos) {
                continue;
            }

            Matcher codigoMatcher = CODIGO_INICIO.matcher(linha);

            if (!codigoMatcher.find()) {
                continue;
            }

            String codigo = codigoMatcher.group(1);

            // Evita números isolados, como quantidades de lotes.
            if (!linha.matches("^\\d{1,6}\\s+.*[A-Za-z].*")) {
                continue;
            }

            // Procura os campos fiscais na linha atual
            // e, quando necessário, nas próximas 3 linhas.
            Matcher camposMatcher = null;

            for (int deslocamento = 0; deslocamento <= 3; deslocamento++) {

                int indice = i + deslocamento;

                if (indice >= linhas.length) {
                    break;
                }

                String linhaBusca = linhas[indice].trim();

                if (linhaBusca.contains("CÁLCULO DO ISSQN")
                        || linhaBusca.contains("DADOS ADICIONAIS")
                        || linhaBusca.contains("DADOS DO PRODUTO, SERVIÇOS")) {
                    break;
                }

                Matcher candidato = CAMPOS_FISCAIS.matcher(linhaBusca);

                if (candidato.find()) {
                    camposMatcher = candidato;
                    break;
                }
            }

            if (camposMatcher == null) {
                continue;
            }

            String unidade = camposMatcher.group(1);

            String quantidadeTexto = camposMatcher.group(2)
                .replace(".", "")
                .replace(",", ".");

            BigDecimal quantidade = new BigDecimal(quantidadeTexto);

            itens.add(Map.of(
                "codigo", codigo,
                "unidade", unidade,
                "quantidade", quantidade
            ));
        }

        return itens;
    }
}
