package com.revitafisio.agendamento.controller;

import com.revitafisio.agendamento.service.HorarioDisponivelService;
import com.revitafisio.records.HorarioDisponivelResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/horarios-disponiveis")
public class HorarioDisponivelController {

    private final HorarioDisponivelService horarioDisponivelService;

    public HorarioDisponivelController(HorarioDisponivelService horarioDisponivelService) {
        this.horarioDisponivelService = horarioDisponivelService;
    }

    @GetMapping
    public ResponseEntity<List<HorarioDisponivelResponse>> buscarDisponibilidade(
            @RequestParam Integer idFisioterapeuta,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        var horarios = horarioDisponivelService.buscarPorFisioEData(idFisioterapeuta, data);
        return ResponseEntity.ok(horarios);
    }
}