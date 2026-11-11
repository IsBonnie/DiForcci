package com.isadiforcci.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.Console;

public class GerarSenha {

    public static void main(String[] args) {
        Console console = System.console();

        if (console == null) {
            System.err.println(
                "Execute este programa em um terminal externo."
            );
            return;
        }

        char[] senha = console.readPassword("Digite a senha do administrador: ");

        if (senha == null || senha.length == 0) {
            System.err.println("A senha não pode ficar vazia.");
            return;
        }

        try {
            String hash = new BCryptPasswordEncoder()
                    .encode(new String(senha));

            System.out.println("Hash BCrypt:");
            System.out.println(hash);
        } finally {
            java.util.Arrays.fill(senha, '\0');
        }
    }
}