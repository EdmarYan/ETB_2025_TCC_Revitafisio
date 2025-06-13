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
    /**
     * Construtor auxiliar para converter a entidade Agendamento em um DTO de resposta.
     * Inclui uma verificação de segurança para evitar NullPointerException caso o status seja nulo.
     * @param agendamento A entidade JPA vinda do banco de dados.
     */
    public AgendamentoResponse(Agendamento agendamento) {
        this(
                agendamento.getIdAgendamento(),
                agendamento.getPaciente().getNome(),
                agendamento.getFisioterapeuta().getNome(),
                agendamento.getEspecialidade().getNome(),
                agendamento.getDataHoraInicio(),
                agendamento.getDataHoraFim(),
                (agendamento.getStatus() != null) ? agendamento.getStatus().name() : "INDEFINIDO"
        );
    }
}