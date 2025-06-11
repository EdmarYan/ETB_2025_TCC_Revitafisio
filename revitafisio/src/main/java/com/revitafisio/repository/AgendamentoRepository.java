package com.revitafisio.repository;

import com.revitafisio.entities.agendamentos.Agendamento;
import com.revitafisio.records.RelatorioAtendimentoResponse; // Importe o novo DTO
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    @Query("SELECT a FROM agendamentos a WHERE a.fisioterapeuta.id = :idFisioterapeuta AND a.dataHoraInicio >= :inicio AND a.dataHoraFim <= :fim")
    List<Agendamento> findByFisioterapeutaAndPeriodo(Integer idFisioterapeuta, LocalDateTime inicio, LocalDateTime fim);

    // #### NOVO MÉTODO PARA O RELATÓRIO ####
    @Query("SELECT new com.revitafisio.records.RelatorioAtendimentoResponse(u.nome, COUNT(a)) " +
            "FROM agendamentos a JOIN a.fisioterapeuta u " +
            "WHERE a.status = 'REALIZADO' AND a.dataHoraInicio BETWEEN :inicio AND :fim " +
            "GROUP BY u.nome")
    List<RelatorioAtendimentoResponse> getRelatorioAtendimentosPorPeriodo(LocalDateTime inicio, LocalDateTime fim);
}