package com.revitafisio.paciente.Controller;

import com.revitafisio.records.AtualizarPacienteRequest;   // Import do novo DTO
import com.revitafisio.records.CriarPacienteRequest;
import com.revitafisio.records.PacienteDetalhesResponse; // Import do novo DTO
import com.revitafisio.records.PacienteResponse;
import com.revitafisio.paciente.service.PacienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteService pacienteService;

    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    @PostMapping
    public ResponseEntity<Void> criarPaciente(@RequestBody CriarPacienteRequest request) {
        var pacienteId = pacienteService.criarPaciente(request);
        return ResponseEntity.created(URI.create("/pacientes/" + pacienteId)).build();
    }

    @GetMapping
    public ResponseEntity<List<PacienteResponse>> buscarPacientes(@RequestParam(name = "nome", required = false) String nome) {
        // Se um 'nome' foi passado na URL, busca por nome.
        if (nome != null && !nome.isBlank()) {
            var listaPacientes = pacienteService.buscarPorNome(nome);
            return ResponseEntity.ok(listaPacientes);
        } else {
            // Se nenhum 'nome' foi passado, busca todos os pacientes.
            var listaPacientes = pacienteService.buscarTodos();
            return ResponseEntity.ok(listaPacientes);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteDetalhesResponse> buscarPorId(@PathVariable Integer id) {
        var paciente = pacienteService.buscarPorId(id);
        return ResponseEntity.ok(paciente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteDetalhesResponse> atualizarPaciente(@PathVariable Integer id, @RequestBody AtualizarPacienteRequest request) {
        var pacienteAtualizado = pacienteService.atualizarPaciente(id, request);
        return ResponseEntity.ok(pacienteAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativarPaciente(@PathVariable Integer id) {
        pacienteService.inativarPaciente(id);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{id}/ativar") // Usando um endpoint específico para a ação
    public ResponseEntity<Void> ativarPaciente(@PathVariable Integer id) {
        pacienteService.ativarPaciente(id);
        return ResponseEntity.noContent().build();
    }
}