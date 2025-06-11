package com.revitafisio.agendamento.controller;

import com.revitafisio.agendamento.service.AgendamentoService;
import com.revitafisio.records.AgendamentoResponse;
import com.revitafisio.records.CriarAgendamentoRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> criarAgendamento(@RequestBody CriarAgendamentoRequest request) {
        var response = agendamentoService.criarAgendamento(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoResponse>> buscarAgenda(
            @RequestParam Integer idFisioterapeuta,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        var agendamentos = agendamentoService.buscarAgenda(idFisioterapeuta, inicio, fim);
        return ResponseEntity.ok(agendamentos);
    }
}