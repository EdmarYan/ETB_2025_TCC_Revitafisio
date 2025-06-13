package com.revitafisio.repository;

import com.revitafisio.entities.agendamentos.Agendamento;
import com.revitafisio.entities.agendamentos.Agendamento.StatusAgendamento;
import com.revitafisio.records.RelatorioAtendimentoResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    /**
     *  metodo de consulta derivado pelo Spring Data JPA.
     * Este metodo faz a mesma busca que a @Query anterior, mas de forma segura e automática.
     * Ele busca agendamentos onde:
     * - O ID do usuário do fisioterapeuta associado é igual ao id passado
     * - A data de início é maior ou igual ao início do período
     * - A data de fim é menor ou igual ao fim do período
     */
    List<Agendamento> findByFisioterapeuta_IdUsuarioAndDataHoraInicioGreaterThanEqualAndDataHoraFimLessThanEqual(
            Integer idFisioterapeuta, LocalDateTime inicio, LocalDateTime fim
    );

    // Esta consulta foi ajustada para usar "Agendamento a" em vez de "agendamentos a"
    @Query("SELECT new com.revitafisio.records.RelatorioAtendimentoResponse(u.nome, COUNT(a)) " +
            "FROM Agendamento a JOIN a.fisioterapeuta u " +
            "WHERE a.status = 'REALIZADO' AND a.dataHoraInicio BETWEEN :inicio AND :fim " +
            "GROUP BY u.nome")
    List<RelatorioAtendimentoResponse> getRelatorioAtendimentosPorPeriodo(LocalDateTime inicio, LocalDateTime fim);

    List<Agendamento> findAllByStatusAndDataHoraInicioBefore(StatusAgendamento status, LocalDateTime data);
}