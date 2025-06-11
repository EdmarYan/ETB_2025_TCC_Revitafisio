package com.revitafisio.agendamento.controller;

import com.revitafisio.agendamento.service.HorarioTrabalhoService;
import com.revitafisio.records.HorarioTrabalhoRequest;
import com.revitafisio.records.HorarioTrabalhoResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/horarios-trabalho")
public class HorarioTrabalhoController {

    private final HorarioTrabalhoService horarioTrabalhoService;

    public HorarioTrabalhoController(HorarioTrabalhoService horarioTrabalhoService) {
        this.horarioTrabalhoService = horarioTrabalhoService;
    }

    @PostMapping
    public ResponseEntity<HorarioTrabalhoResponse> adicionarHorario(@RequestBody HorarioTrabalhoRequest request) {
        var response = horarioTrabalhoService.adicionarHorario(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/fisioterapeuta/{id}")
    public ResponseEntity<List<HorarioTrabalhoResponse>> listarPorFisioterapeuta(@PathVariable Integer id) {
        var horarios = horarioTrabalhoService.listarHorariosPorFisioterapeuta(id);
        return ResponseEntity.ok(horarios);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerHorario(@PathVariable Integer id) {
        horarioTrabalhoService.removerHorario(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/gerar-disponibilidade")
    public ResponseEntity<Void> gerarDisponibilidade(@RequestParam Integer idFisioterapeuta, @RequestParam int ano, @RequestParam int mes) {
        horarioTrabalhoService.gerarDisponibilidadeParaMes(idFisioterapeuta, ano, mes);
        return ResponseEntity.ok().build();
    }
}