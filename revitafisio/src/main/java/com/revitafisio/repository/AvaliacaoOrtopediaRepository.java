package com.revitafisio.repository;

import com.revitafisio.entities.paciente.AvaliacaoOrtopedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AvaliacaoOrtopediaRepository extends JpaRepository<AvaliacaoOrtopedia, Integer> {

    // Busca uma avaliação de ortopedia pelo ID do paciente.
    // Um paciente pode ter apenas uma avaliação inicial deste tipo.
    Optional<AvaliacaoOrtopedia> findByPacienteIdUsuario(Integer idPaciente);
}