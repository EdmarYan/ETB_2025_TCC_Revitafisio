package com.revitafisio.repository;

import com.revitafisio.entities.usuarios.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Usuario, Integer> {

    /**
     * Busca todos os usuários que NÃO SÃO do tipo Paciente.
     * A cláusula "TYPE(u) != Paciente" filtra pela classe da entidade na hierarquia.
     */
    @Query("SELECT u FROM Usuario u WHERE TYPE(u) != Paciente")
    List<Usuario> findAllFuncionarios();

    /**
     * Busca um único usuário por ID, garantindo que não seja um Paciente.
     * @param id O ID do usuário a ser buscado.
     * @return um Optional contendo o usuário se for um funcionário, ou vazio caso contrário.
     */
    @Query("SELECT u FROM Usuario u WHERE u.idUsuario = :id AND TYPE(u) != Paciente")
    Optional<Usuario> findFuncionarioById(Integer id);
}