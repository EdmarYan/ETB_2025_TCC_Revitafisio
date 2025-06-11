package com.revitafisio.auth.dto;

import java.util.Set;

public record RegisterRequest(
        String cpf,
        String senha,
        String tipo,
        Set<String> authorities
) {}
