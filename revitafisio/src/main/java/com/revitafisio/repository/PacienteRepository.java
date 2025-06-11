package com.revitafisio.repository;

import com.revitafisio.entities.usuarios.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    // Este metodo mágico do Spring Data JPA vai procurar por pacientes
    // cujo nome contenha o texto que passarmos, ignorando maiúsculas/minúsculas.
    List<Paciente> findByNomeContainingIgnoreCase(String nome);
}