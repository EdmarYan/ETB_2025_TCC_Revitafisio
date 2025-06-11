package com.revitafisio.agendamento.controller;

import com.revitafisio.records.AgendamentoResponse;
import com.revitafisio.records.AtualizarStatusRequest;
import com.revitafisio.records.CriarAgendamentoRequest;
import com.revitafisio.agendamento.service.AgendamentoService;
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
        var agendamento = agendamentoService.criarAgendamento(request);
        return ResponseEntity.ok(agendamento);
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoResponse>> buscarAgenda(@RequestParam Integer idFisioterapeuta,
                                                                  @RequestParam LocalDateTime inicio,
                                                                  @RequestParam LocalDateTime fim) {
        var agenda = agendamentoService.buscarAgenda(idFisioterapeuta, inicio, fim);
        return ResponseEntity.ok(agenda);
    }

    @GetMapping("/pendentes-status")
    public ResponseEntity<List<AgendamentoResponse>> buscarPendentes() {
        return ResponseEntity.ok(agendamentoService.buscarAgendamentosPendentesDeStatus());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> atualizarStatus(@PathVariable Integer id, @RequestBody AtualizarStatusRequest request) {
        agendamentoService.atualizarStatus(id, request.novoStatus());
        return ResponseEntity.noContent().build();
    }
}