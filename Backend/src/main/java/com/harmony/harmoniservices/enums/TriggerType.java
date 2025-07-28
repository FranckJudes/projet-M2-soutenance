package com.harmony.harmoniservices.enums;

public enum TriggerType {

    NONE("none"),
    MESSAGE("message"),
    SIGNAL("signal"),
    TIMER("timer"),
    CONDITIONAL("conditional"),
    ERROR("error"),
    ESCALATION("escalation"),
    COMPENSATION("compensation"),
    LINK("link"),
    TERMINATE("terminate");
  

    private final String value;

    TriggerType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
