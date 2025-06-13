package com.revitafisio.agendamento.service;

import com.revitafisio.records.HorarioDisponivelResponse;
import com.revitafisio.repository.HorarioDisponivelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HorarioDisponivelService {

    private final HorarioDisponivelRepository horarioDisponivelRepository;

    public HorarioDisponivelService(HorarioDisponivelRepository horarioDisponivelRepository) {
        this.horarioDisponivelRepository = horarioDisponivelRepository;
    }


    @Transactional(readOnly = true)
    public List<HorarioDisponivelResponse> buscarPorFisioEPeriodo(Integer idFisioterapeuta, LocalDate inicio, LocalDate fim) {
        return horarioDisponivelRepository.findByFisioterapeutaIdUsuarioAndDataBetween(idFisioterapeuta, inicio, fim)
                .stream()
                .map(HorarioDisponivelResponse::new)
                .collect(Collectors.toList());
    }
}