package com.revitafisio.funcionario.controller;

import com.revitafisio.funcionario.service.FuncionarioService;
import com.revitafisio.records.CriarFuncionarioRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.net.URI;

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
}