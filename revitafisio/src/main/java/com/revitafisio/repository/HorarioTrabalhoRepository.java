package com.revitafisio.repository;

import com.revitafisio.entities.agendamentos.HorarioTrabalho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek; // Verifique se este import está presente
import java.util.List;

@Repository
public interface HorarioTrabalhoRepository extends JpaRepository<HorarioTrabalho, Integer> {
    List<HorarioTrabalho> findByFisioterapeutaIdUsuario(Integer idFisioterapeuta);

    /**
     * Busca a grade de trabalho de um fisioterapeuta para um dia específico da semana.
     */
    List<HorarioTrabalho> findByFisioterapeuta_IdUsuarioAndDiaDaSemana(Integer idFisioterapeuta, DayOfWeek diaDaSemana);
}