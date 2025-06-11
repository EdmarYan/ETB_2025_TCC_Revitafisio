package com.revitafisio.records;

import java.time.LocalDate;
import java.util.List;

// Dados que a API recebe para ATUALIZAR um paciente. Note que não pedimos CPF ou senha.
public record AtualizarPacienteRequest(
        String nome,
        LocalDate dataNascimento,
        List<CriarContatoRequest> contatos
) {
}