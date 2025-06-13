package com.revitafisio.repository;

import com.revitafisio.entities.agendamentos.HorarioDisponivel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HorarioDisponivelRepository extends JpaRepository<HorarioDisponivel, Integer> {

    List<HorarioDisponivel> findByFisioterapeutaIdUsuarioAndDataBetween(Integer idFisioterapeuta, LocalDate dataInicio, LocalDate dataFim);

    // Metodo para apagar os horários de um profissional em um determinado mês (para regerar a agenda)
    void deleteByFisioterapeutaIdUsuarioAndDataBetween(Integer idFisioterapeuta, LocalDate dataInicio, LocalDate dataFim);

    // Metodo que busca por um slot específico (usado na criação do agendamento)
    List<HorarioDisponivel> findByFisioterapeutaIdUsuarioAndDataAndHoraInicio(Integer idFisioterapeuta, LocalDate data, LocalTime horaInicio);
}