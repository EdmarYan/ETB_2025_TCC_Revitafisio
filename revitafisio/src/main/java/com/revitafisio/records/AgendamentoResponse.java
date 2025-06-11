package com.revitafisio.records;

import com.revitafisio.entities.agendamentos.Agendamento;
import java.time.LocalDateTime;

public record AgendamentoResponse(
        Integer id,
        String nomePaciente,
        String nomeFisioterapeuta,
        String nomeEspecialidade,
        LocalDateTime inicio,
        LocalDateTime fim,
        String status
) {
    // Construtor auxiliar para facilitar
    public AgendamentoResponse(Agendamento agendamento) {
        this(
                agendamento.getIdAgendamento(),
                agendamento.getPaciente().getNome(),
                agendamento.getFisioterapeuta().getNome(),
                agendamento.getEspecialidade().getNome(),
                agendamento.getDataHoraInicio(),
                agendamento.getDataHoraFim(),
                agendamento.getStatus().name()
        );
    }
}