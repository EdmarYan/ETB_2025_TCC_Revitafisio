package com.revitafisio.entities.usuarios;

import com.revitafisio.entities.usuarios.Especialidade;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.HashSet; // Importe o HashSet
import java.util.Set;    // Importe o Set

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("FISIOTERAPEUTA")
public class Fisioterapeuta extends Usuario {

    // CAMPO NOVO ADICIONADO AQUI
    @ManyToMany(fetch = FetchType.EAGER) // EAGER para carregar as especialidades junto com o fisioterapeuta
    @JoinTable(
            name = "fisioterapeuta_especialidades", // Nome da nova tabela de ligação
            joinColumns = @JoinColumn(name = "fisioterapeuta_id"), // Coluna que se refere a esta entidade (Fisioterapeuta)
            inverseJoinColumns = @JoinColumn(name = "especialidade_id") // Coluna que se refere à outra entidade (Especialidade)
    )
    private Set<Especialidade> especialidades = new HashSet<>();

}