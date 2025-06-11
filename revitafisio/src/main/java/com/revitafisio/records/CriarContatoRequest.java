package com.revitafisio.records;

import com.revitafisio.entities.usuarios.Contato;

public record CriarContatoRequest(
        Contato.TipoContato tipo,
        String valor,
        boolean principal
) {
}