package com.revitafisio.records;

import java.time.LocalDate;

// Este record define os dados necessários para criar qualquer tipo de funcionário.
public record CriarFuncionarioRequest(
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String senha,
        TipoFuncionario tipo // Este campo é a chave para sabermos qual tipo criar
) {
    // Enum para definir os tipos de funcionários possíveis.
    public enum TipoFuncionario {
        FISIOTERAPEUTA,
        RECEPCIONISTA,
        ADMIN
    }
}