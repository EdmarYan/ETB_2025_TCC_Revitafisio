package com.revitafisio.repository;

import com.revitafisio.entities.paciente.AvaliacaoRpg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AvaliacaoRpgRepository extends JpaRepository<AvaliacaoRpg, Integer> {
    Optional<AvaliacaoRpg> findByPacienteIdUsuario(Integer idPaciente);
}