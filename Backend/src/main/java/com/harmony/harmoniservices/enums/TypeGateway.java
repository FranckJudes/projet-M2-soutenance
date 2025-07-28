package com.harmony.harmoniservices.enums;

public enum TypeGateway {
    
    EXCLUSIVE("exclusive"),
    PARALLEL("parallel"),
    INCLUSIVE("inclusive"),
    COMPLEX("complex"),
    EVENT_BASED("eventBased"),
    UNKNOWN("unknown"); 

    private final String value;

    TypeGateway(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
