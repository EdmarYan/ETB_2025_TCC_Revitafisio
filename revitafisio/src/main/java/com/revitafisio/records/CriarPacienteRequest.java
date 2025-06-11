package com.revitafisio.records;
import java.time.LocalDate;
import java.util.List;

// Note que o campo "senha" foi removido daqui.
public record CriarPacienteRequest(
        String nome,
        String cpf,
        LocalDate dataNascimento,
        List<CriarContatoRequest> contatos
) {
}