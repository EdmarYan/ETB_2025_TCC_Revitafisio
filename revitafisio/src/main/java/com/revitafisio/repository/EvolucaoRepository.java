package com.revitafisio.repository;

import com.revitafisio.entities.paciente.Evolucao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvolucaoRepository extends JpaRepository<Evolucao, Integer> {

    // Método mágico do Spring Data: busca todas as evoluções de um paciente
    // e as ordena pela data em ordem decrescente (da mais nova para a mais antiga).
    List<Evolucao> findByPacienteIdUsuarioOrderByDataDesc(Integer idPaciente);
}