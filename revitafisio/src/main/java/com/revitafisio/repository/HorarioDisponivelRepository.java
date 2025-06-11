package com.revitafisio.repository;

import com.revitafisio.entities.agendamentos.HorarioDisponivel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HorarioDisponivelRepository extends JpaRepository<HorarioDisponivel, Integer> {

    // Busca todos os horários disponíveis para um fisioterapeuta em uma data específica
    List<HorarioDisponivel> findByFisioterapeutaIdUsuarioAndData(Integer idFisioterapeuta, LocalDate data);

    // Método para apagar os horários de um profissional em um determinado mês (para regerar a agenda)
    void deleteByFisioterapeutaIdUsuarioAndDataBetween(Integer idFisioterapeuta, LocalDate dataInicio, LocalDate dataFim);
}