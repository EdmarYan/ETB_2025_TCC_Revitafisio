package com.revitafisio.entities.agendamentos;

import com.revitafisio.entities.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "horarios_trabalho")
public class HorarioTrabalho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario_trabalho")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_fisioterapeuta", nullable = false)
    private Usuario fisioterapeuta;

    // REMOVA a anotação @Enumerated. O @Converter(autoApply=true) cuidará disso.
    @Column(name = "dia_semana", nullable = false)
    private DayOfWeek diaDaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    private boolean ativo = true;
}