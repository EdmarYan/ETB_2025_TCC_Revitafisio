package com.revitafisio.relatorio.service;

import com.revitafisio.records.RelatorioAtendimentoResponse;
import com.revitafisio.repository.AgendamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
public class RelatorioService {

    private final AgendamentoRepository agendamentoRepository;

    public RelatorioService(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<RelatorioAtendimentoResponse> gerarRelatorioAtendimentos(int ano, int mes) {
        YearMonth anoMes = YearMonth.of(ano, mes);
        LocalDateTime inicioDoMes = anoMes.atDay(1).atStartOfDay();
        LocalDateTime fimDoMes = anoMes.atEndOfMonth().atTime(23, 59, 59);

        return agendamentoRepository.getRelatorioAtendimentosPorPeriodo(inicioDoMes, fimDoMes);
    }
}