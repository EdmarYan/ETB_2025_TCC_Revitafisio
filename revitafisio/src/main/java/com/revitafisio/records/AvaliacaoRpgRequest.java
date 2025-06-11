package com.revitafisio.records;

import com.revitafisio.entities.paciente.AvaliacaoRpg;

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
        Boolean ressonancia_magnetica,
        Boolean raio_x,
        Boolean tomografia,
        Boolean uso_medicamentos,
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