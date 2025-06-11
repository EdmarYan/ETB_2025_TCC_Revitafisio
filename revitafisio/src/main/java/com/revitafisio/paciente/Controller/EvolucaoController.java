package com.revitafisio.paciente.Controller;

import com.revitafisio.paciente.service.EvolucaoService;
import com.revitafisio.records.CriarEvolucaoRequest;
import com.revitafisio.records.EvolucaoResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/evolucoes") // Usaremos uma rota dedicada para as evoluções
public class EvolucaoController {

    private final EvolucaoService evolucaoService;

    public EvolucaoController(EvolucaoService evolucaoService) {
        this.evolucaoService = evolucaoService;
    }

    @PostMapping
    public ResponseEntity<EvolucaoResponse> salvarEvolucao(@RequestBody CriarEvolucaoRequest request) {
        var evolucaoSalva = evolucaoService.salvarEvolucao(request);
        // Retorna 201 Created com o objeto criado no corpo da resposta
        return ResponseEntity.created(URI.create("/evolucoes/" + evolucaoSalva.idEvolucao())).body(evolucaoSalva);
    }

    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<List<EvolucaoResponse>> listarPorPaciente(@PathVariable Integer idPaciente) {
        var listaEvolucoes = evolucaoService.listarEvolucoesPorPaciente(idPaciente);
        return ResponseEntity.ok(listaEvolucoes);
    }
}