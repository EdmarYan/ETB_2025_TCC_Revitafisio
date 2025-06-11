package com.revitafisio.records;

import com.revitafisio.entities.paciente.AvaliacaoRpg;

// DTO para receber os dados do formulário de RPG, usando os Enums.
public record AvaliacaoRpgRequest(
        Integer idPaciente,
        Integer idFisioterapeuta,
        String diagnostico_clinico,
        String hma,
        String posicao_dor,
        String outras_patologias,
        String outros_exames,
        String medicamentos_descricao,
        String outros_desequilibrios,
        String tratamento_proposto,
        String observacoes,
        boolean ressonancia_magnetica,
        boolean raio_x,
        boolean tomografia,
        boolean uso_medicamentos,
        AvaliacaoRpg.GrauDor grau_dor,
        AvaliacaoRpg.PosicaoCabeca cabeca,
        AvaliacaoRpg.NivelamentoOmbros ombros,
        AvaliacaoRpg.SimetriaMaos maos,
        AvaliacaoRpg.SimetriaEias eias,
        AvaliacaoRpg.PosicaoJoelhos joelhos,
        AvaliacaoRpg.CurvaturaLombar lombar,
        AvaliacaoRpg.PosicaoPelve pelve,
        AvaliacaoRpg.PosicaoEscapulas escapulas
) {
}