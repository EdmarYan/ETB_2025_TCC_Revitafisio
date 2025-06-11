package com.revitafisio.records;
import java.time.LocalDate;
import java.util.List;

public record CriarPacienteRequest(
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String senha,
        List<CriarContatoRequest> contatos // Você também pode criar um record para o contato
) {
}