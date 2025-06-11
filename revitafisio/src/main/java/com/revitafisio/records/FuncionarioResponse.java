package com.revitafisio.records;

/**
 * DTO para transportar dados resumidos de um funcionário em listas.
 */
public record FuncionarioResponse(
        Integer id,
        String nome,
        String tipo // Para sabermos se é FISIOTERAPEUTA, ADMIN, etc.
) {
}