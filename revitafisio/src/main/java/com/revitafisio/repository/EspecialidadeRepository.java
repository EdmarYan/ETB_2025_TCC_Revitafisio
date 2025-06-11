package com.revitafisio.repository;

import com.revitafisio.entities.usuarios.Especialidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadeRepository extends JpaRepository<Especialidade, Integer> {
    // Está vazio de propósito!
    // A interface JpaRepository já nos fornece todos os métodos básicos que precisamos,
    // como findAll(), findById(), e findAllById().
}