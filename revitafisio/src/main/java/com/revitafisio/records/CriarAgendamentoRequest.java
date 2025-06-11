package com.revitafisio.records;

import java.time.LocalDateTime;

public record CriarAgendamentoRequest(
        Integer idPaciente,
        Integer idFisioterapeuta,
        Integer idEspecialidade,
        LocalDateTime dataHoraInicio,
        LocalDateTime dataHoraFim
) {
}