package com.revitafisio.records;

// DTO com os dados necessários para criar uma nova evolução.
public record CriarEvolucaoRequest(
        Integer idPaciente,
        Integer idFisioterapeuta,
        String descricao
) {
}