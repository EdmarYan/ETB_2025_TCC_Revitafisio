package com.revitafisio.records;

import java.math.BigDecimal;

// DTO com todos os campos do formulário para criar/atualizar uma avaliação.
public record AvaliacaoOrtopediaRequest(
        Integer idPaciente,
        Integer idFisioterapeuta,
        String profissao,
        String pressao_arterial,
        String avaliacao_postural,
        String alergias,
        String indicacao_medica,
        String queixa_principal,
        String hda_hdp,
        String doencas_cardiacas,
        String comorbidades,
        String medicacoes,
        String diagnostico_fisioterapeutico,
        String objetivos,
        String conduta,
        String observacoes,
        Integer frequencia_cardiaca,
        Integer frequencia_respiratoria,
        BigDecimal temperatura
) {
}