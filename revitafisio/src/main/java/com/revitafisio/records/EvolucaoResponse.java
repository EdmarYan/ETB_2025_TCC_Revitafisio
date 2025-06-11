package com.revitafisio.records;

import com.revitafisio.entities.paciente.Evolucao;

import java.time.LocalDate;

// DTO para enviar os dados de uma evolução já existente para o frontend.
public record EvolucaoResponse(
        Integer idEvolucao,
        LocalDate data,
        String descricao,
        String nomeFisioterapeuta
) {
    // Construtor auxiliar para facilitar a conversão da Entidade para o DTO
    public EvolucaoResponse(Evolucao evolucao) {
        this(
                evolucao.getIdEvolucao(),
                evolucao.getData(),
                evolucao.getDescricao(),
                evolucao.getFisioterapeuta().getNome() // Pega o nome do fisioterapeuta associado
        );
    }
}