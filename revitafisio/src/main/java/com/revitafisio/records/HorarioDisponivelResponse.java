package com.revitafisio.records;

import com.revitafisio.entities.agendamentos.HorarioDisponivel;
import java.time.LocalTime;

public record HorarioDisponivelResponse(
        Integer id,
        LocalTime horaInicio,
        LocalTime horaFim,
        boolean disponivel
) {
    public HorarioDisponivelResponse(HorarioDisponivel horario) {
        this(horario.getIdHorario(), horario.getHoraInicio(), horario.getHoraFim(), horario.isDisponivel());
    }
}