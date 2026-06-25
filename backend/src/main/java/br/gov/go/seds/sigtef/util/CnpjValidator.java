package br.gov.go.seds.sigtef.util;

public class CnpjValidator {

    public static boolean isValid(String cnpj) {
        if (cnpj == null) return false;
        
        // Remove non-digit characters
        cnpj = cnpj.replaceAll("\\D", "");

        if (cnpj.length() != 14) return false;

        // Check for all identical digits (which pass the math test but are invalid)
        if (cnpj.matches("(\\d)\\1{13}")) return false;

        char[] chars = cnpj.toCharArray();
        int[] digits = new int[14];
        for (int i = 0; i < 14; i++) {
            digits[i] = chars[i] - '0';
        }

        // Validate first check digit
        int sum1 = 0;
        int[] weight1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        for (int i = 0; i < 12; i++) {
            sum1 += digits[i] * weight1[i];
        }
        int mod1 = sum1 % 11;
        int digit1 = mod1 < 2 ? 0 : 11 - mod1;
        if (digits[12] != digit1) return false;

        // Validate second check digit
        int sum2 = 0;
        int[] weight2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        for (int i = 0; i < 13; i++) {
            sum2 += digits[i] * weight2[i];
        }
        int mod2 = sum2 % 11;
        int digit2 = mod2 < 2 ? 0 : 11 - mod2;
        if (digits[13] != digit2) return false;

        return true;
    }
}
