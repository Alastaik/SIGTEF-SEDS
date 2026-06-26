package br.gov.go.seds.sigtef.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        System.out.println("HASH_GENERATED:" + new BCryptPasswordEncoder().encode("senha123"));
    }
}
