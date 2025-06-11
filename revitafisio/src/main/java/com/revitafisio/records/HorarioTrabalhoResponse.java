package com.revitafisio.records;

import com.revitafisio.entities.agendamentos.HorarioTrabalho;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Locale;

/**
 * DTO para exibir um item da grade de horários.
 */
public record HorarioTrabalhoResponse(
        Integer id,
        DayOfWeek diaDaSemana,
        String nomeDiaSemana, // Campo para facilitar a exibição no frontend
        LocalTime horaInicio,
        LocalTime horaFim
) {
    // Construtor auxiliar para conversão
    public HorarioTrabalhoResponse(HorarioTrabalho horario) {
        this(
                horario.getId(),
                horario.getDiaDaSemana(),
                horario.getDiaDaSemana().getDisplayName(TextStyle.FULL, new Locale("pt", "BR")),
                horario.getHoraInicio(),
                horario.getHoraFim()
        );
    }
}