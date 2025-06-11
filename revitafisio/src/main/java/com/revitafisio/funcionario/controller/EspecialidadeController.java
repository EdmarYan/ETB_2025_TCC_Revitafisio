package com.revitafisio.funcionario.controller;

import com.revitafisio.entities.usuarios.Especialidade;
import com.revitafisio.repository.EspecialidadeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/especialidades")
public class EspecialidadeController {

    private final EspecialidadeRepository especialidadeRepository;

    public EspecialidadeController(EspecialidadeRepository especialidadeRepository) {
        this.especialidadeRepository = especialidadeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Especialidade>> listarEspecialidades() {
        return ResponseEntity.ok(especialidadeRepository.findAll());
    }
}