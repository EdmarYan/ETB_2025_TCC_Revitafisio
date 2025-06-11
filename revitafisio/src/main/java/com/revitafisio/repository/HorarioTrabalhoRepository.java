package com.revitafisio.repository;

import com.revitafisio.entities.agendamentos.HorarioTrabalho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioTrabalhoRepository extends JpaRepository<HorarioTrabalho, Integer> {
    List<HorarioTrabalho> findByFisioterapeutaIdUsuario(Integer idFisioterapeuta);
}