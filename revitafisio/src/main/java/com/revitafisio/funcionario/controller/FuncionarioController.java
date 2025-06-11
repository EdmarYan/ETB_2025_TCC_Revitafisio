package com.revitafisio.funcionario.controller;

import com.revitafisio.entities.usuarios.Usuario;
import com.revitafisio.funcionario.service.FuncionarioService;
import com.revitafisio.records.AtualizarFuncionarioRequest;
import com.revitafisio.records.CriarFuncionarioRequest;
import com.revitafisio.records.FuncionarioResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    public FuncionarioController(FuncionarioService funcionarioService) {
        this.funcionarioService = funcionarioService;
    }

    @PostMapping
    public ResponseEntity<Void> criarFuncionario(@RequestBody CriarFuncionarioRequest request) {
        var funcionarioId = funcionarioService.criarFuncionario(request);
        return ResponseEntity.created(URI.create("/funcionarios/" + funcionarioId)).build();
    }

    @GetMapping
    public ResponseEntity<List<FuncionarioResponse>> listarFuncionarios() {
        var funcionarios = funcionarioService.buscarTodos();
        return ResponseEntity.ok(funcionarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Integer id) {
        var funcionario = funcionarioService.buscarDetalhesPorId(id);
        return ResponseEntity.ok(funcionario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizarFuncionario(@PathVariable Integer id, @RequestBody AtualizarFuncionarioRequest request) {
        var funcionarioAtualizado = funcionarioService.atualizarFuncionario(id, request);
        return ResponseEntity.ok(funcionarioAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativarFuncionario(@PathVariable Integer id) {
        funcionarioService.inativarFuncionario(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarFuncionario(@PathVariable Integer id) {
        funcionarioService.ativarFuncionario(id);
        return ResponseEntity.noContent().build();
    }
}