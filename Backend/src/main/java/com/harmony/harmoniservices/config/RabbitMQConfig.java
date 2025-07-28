package com.harmony.harmoniservices.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;

@Configuration
public class RabbitMQConfig {

    public static final String USER_EXCHANGE_NAME = "UserExchange";
    public static final String USER_QUEUE_NAME = "UserQueue";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Bean
    FanoutExchange userExchange() {
        return new FanoutExchange(USER_EXCHANGE_NAME);
    }

    @Bean
    Queue userQueue() {
        return new Queue(USER_QUEUE_NAME, true);
    }

    @Bean
    Binding binding(Queue userQueue, FanoutExchange userExchange) {
        return BindingBuilder.bind(userQueue)
               .to(userExchange);
    }
}