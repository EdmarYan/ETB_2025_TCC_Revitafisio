package com.revitafisio.paciente.Controller;

import com.revitafisio.entities.paciente.AvaliacaoRpg;
import com.revitafisio.paciente.service.AvaliacaoRpgService;
import com.revitafisio.records.AvaliacaoRpgRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/avaliacoes/rpg")
public class AvaliacaoRpgController {

    private final AvaliacaoRpgService avaliacaoService;

    public AvaliacaoRpgController(AvaliacaoRpgService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoRpg> salvarAvaliacao(@RequestBody AvaliacaoRpgRequest request) {
        var avaliacaoSalva = avaliacaoService.salvar(request);
        return ResponseEntity.ok(avaliacaoSalva);
    }

    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<AvaliacaoRpg> buscarPorPaciente(@PathVariable Integer idPaciente) {
        return avaliacaoService.buscarPorPaciente(idPaciente)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}