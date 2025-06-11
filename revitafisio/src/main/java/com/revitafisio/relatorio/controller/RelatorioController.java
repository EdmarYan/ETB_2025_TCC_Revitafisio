package com.revitafisio.relatorio.controller;

import com.revitafisio.records.RelatorioAtendimentoResponse;
import com.revitafisio.relatorio.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/atendimentos-mensal")
    public ResponseEntity<List<RelatorioAtendimentoResponse>> getRelatorioAtendimentos(
            @RequestParam int ano,
            @RequestParam int mes
    ) {
        var relatorio = relatorioService.gerarRelatorioAtendimentos(ano, mes);
        return ResponseEntity.ok(relatorio);
    }
}