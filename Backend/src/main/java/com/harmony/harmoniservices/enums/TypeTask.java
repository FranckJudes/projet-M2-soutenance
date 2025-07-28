package com.harmony.harmoniservices.enums;

public enum TypeTask {
    NONE("none"),
    TASK("task"),           // Ajout du type générique TASK
    USER("user"),
    SERVICE("service"),
    SCRIPT("script"),
    BUSINESS_RULE("businessRule"),
    SEND("send"),
    RECEIVE("receive"),
    MANUAL("manual");

    private final String value;

    TypeTask(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}