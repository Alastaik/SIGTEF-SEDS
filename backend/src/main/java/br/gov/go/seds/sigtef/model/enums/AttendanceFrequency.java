package br.gov.go.seds.sigtef.model.enums;

public enum AttendanceFrequency {
    WEEKDAYS("Segunda a Sexta-feira"),
    EVERY_DAY("Todos os Dias"),
    MANUAL("Dias Informados Manualmente");

    private final String description;

    AttendanceFrequency(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
