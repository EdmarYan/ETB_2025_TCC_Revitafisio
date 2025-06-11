package com.revitafisio.entities.usuarios;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("FISIOTERAPEUTA")
public class Fisioterapeuta extends Usuario {

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "fisioterapeuta_especialidades",
            joinColumns = @JoinColumn(name = "fisioterapeuta_id"),
            inverseJoinColumns = @JoinColumn(name = "especialidade_id")
    )
    // GARANTA QUE A INICIALIZAÇÃO "new HashSet<>()" ESTEJA AQUI
    private Set<Especialidade> especialidades = new HashSet<>();

}