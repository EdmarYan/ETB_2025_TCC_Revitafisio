package com.revitafisio.records;

import com.revitafisio.entities.usuarios.Contato;
import java.time.LocalDate;
import java.util.Set;

// Dados detalhados de UM paciente, que a API devolve.
public record PacienteDetalhesResponse(
        Integer id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        boolean ativo,
        Set<Contato> contatos
) {
}