package com.revitafisio.records;

import com.revitafisio.entities.usuarios.Especialidade;
import com.revitafisio.entities.usuarios.Fisioterapeuta;
import com.revitafisio.entities.usuarios.Usuario;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Set;

public record FuncionarioDetalhesResponse(
        Integer idUsuario,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        boolean ativo,
        String tipo_usuario,
        Set<Especialidade> especialidades
) {
    public static FuncionarioDetalhesResponse from(Usuario usuario) {
        Set<Especialidade> especialidades = (usuario instanceof Fisioterapeuta) ?
                ((Fisioterapeuta) usuario).getEspecialidades() : Collections.emptySet();

        return new FuncionarioDetalhesResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getCpf(),
                usuario.getDataNascimento(),
                usuario.isAtivo(),
                usuario.getClass().getSimpleName().toUpperCase(),
                especialidades
        );
    }
}