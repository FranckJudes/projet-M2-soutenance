package com.harmony.harmoniservices.enums;

public enum TypeEvent {
    
    START("start"),
    BOUNDARY_EVENT("boundary_event"),
    INTERMEDIATE("intermediate"),
    INTERMEDIATE_CATCH_EVENT("intermediate_catch_event"),
    INTERMEDIATE_THROW_EVENT("intermediate_throw_event"),
    MESSAGE_INTERMEDITE_CATCH_EVENT("message_intermediate_catch_event"),
    MESSAGE_INTERMEDITE_THROW_EVENT("message_intermediate_throw_event"),
    SIGNAL_INTERMEDITE_CATCH_EVENT("signal_intermediate_catch_event"),
    SIGNAL_INTERMEDITE_THROW_EVENT("signal_intermediate_throw_event"),
    TIMER_INTERMEDITE_CATCH_EVENT("timer_intermediate_catch_event"),
    TIMER_INTERMEDITE_THROW_EVENT("timer_intermediate_throw_event"),
    COMPENSATION_INTERMEDITE_CATCH_EVENT("compensation_intermediate_catch_event"),
    COMPENSATION_INTERMEDITE_THROW_EVENT("compensation_intermediate_throw_event"),
    LINK_INTERMEDITE_CATCH_EVENT("link_intermediate_catch_event"),
    LINK_INTERMEDITE_THROW_EVENT("link_intermediate_throw_event"),
    ERROR_INTERMEDITE_CATCH_EVENT("error_intermediate_catch_event"),
    ERROR_INTERMEDITE_THROW_EVENT("error_intermediate_throw_event"),
    TERMINATE_INTERMEDITE_CATCH_EVENT("terminate_intermediate_catch_event"),
    TERMINATE_INTERMEDITE_THROW_EVENT("terminate_intermediate_throw_event"),
    UNKNOWN("unknown"),
    END("end");
  

    private final String value;

    TypeEvent(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
