package com.harmony.harmoniservices.enums;

public enum TypeGroupe {

    TYPE_0("0"),
    TYPE_1("1"),
    TYPE_2("2"),
    TYPE_3("3"),
    TYPE_4("4"),
    TYPE_5("5");

    private final String value;

    TypeGroupe(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
