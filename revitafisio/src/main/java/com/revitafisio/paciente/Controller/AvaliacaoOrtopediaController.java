package com.revitafisio.paciente.Controller;

import com.revitafisio.entities.paciente.AvaliacaoOrtopedia;
import com.revitafisio.paciente.service.AvaliacaoOrtopediaService;
import com.revitafisio.records.AvaliacaoOrtopediaRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/avaliacoes/ortopedia")
public class AvaliacaoOrtopediaController {

    private final AvaliacaoOrtopediaService avaliacaoService;

    public AvaliacaoOrtopediaController(AvaliacaoOrtopediaService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoOrtopedia> salvarAvaliacao(@RequestBody AvaliacaoOrtopediaRequest request) {
        var avaliacaoSalva = avaliacaoService.salvar(request);
        return ResponseEntity.ok(avaliacaoSalva);
    }

    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<AvaliacaoOrtopedia> buscarPorPaciente(@PathVariable Integer idPaciente) {
        return avaliacaoService.buscarPorPaciente(idPaciente)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}