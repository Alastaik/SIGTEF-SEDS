package br.gov.go.seds.sigtef.util;

public class CpfValidator {

    public static boolean isValid(String cpf) {
        if (cpf == null || cpf.isEmpty()) {
            return false;
        }

        cpf = cpf.replaceAll("\\D", "");

        if (cpf.length() != 11) {
            return false;
        }

        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        try {
            int sm = 0;
            int peso = 10;
            for (int i = 0; i < 9; i++) {
                int num = cpf.charAt(i) - 48;
                sm = sm + (num * peso);
                peso = peso - 1;
            }

            int r = 11 - (sm % 11);
            char dig10 = (r == 10 || r == 11) ? '0' : (char) (r + 48);

            sm = 0;
            peso = 11;
            for (int i = 0; i < 10; i++) {
                int num = cpf.charAt(i) - 48;
                sm = sm + (num * peso);
                peso = peso - 1;
            }

            r = 11 - (sm % 11);
            char dig11 = (r == 10 || r == 11) ? '0' : (char) (r + 48);

            return (dig10 == cpf.charAt(9)) && (dig11 == cpf.charAt(10));
        } catch (Exception e) {
            return false;
        }
    }
}
