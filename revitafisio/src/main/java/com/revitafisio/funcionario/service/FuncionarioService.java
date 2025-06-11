package com.revitafisio.funcionario.service;

import com.revitafisio.entities.usuarios.Admin;
import com.revitafisio.entities.usuarios.Fisioterapeuta;
import com.revitafisio.entities.usuarios.Recepcionista;
import com.revitafisio.entities.usuarios.Usuario;
import com.revitafisio.records.CriarFuncionarioRequest;
import com.revitafisio.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FuncionarioService {

    private final UsuarioRepository usuarioRepository;

    // Como removemos a segurança, não precisamos mais do PasswordEncoder aqui.
    public FuncionarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Integer criarFuncionario(CriarFuncionarioRequest request) {
        // 1. Verifica se o CPF já existe para evitar duplicatas.
        if (usuarioRepository.findByCpf(request.cpf()).isPresent()) {
            throw new RuntimeException("CPF já cadastrado.");
        }

        Usuario novoFuncionario;

        // 2. Lógica para criar a instância da classe correta (Fisioterapeuta, Admin, etc.)
        switch (request.tipo()) {
            case FISIOTERAPEUTA -> novoFuncionario = new Fisioterapeuta();
            case RECEPCIONISTA -> novoFuncionario = new Recepcionista();
            case ADMIN -> novoFuncionario = new Admin();
            default -> throw new IllegalArgumentException("Tipo de funcionário inválido: " + request.tipo());
        }

        // 3. Preenche os dados comuns a todos os funcionários.
        novoFuncionario.setNome(request.nome());
        novoFuncionario.setCpf(request.cpf());
        novoFuncionario.setDataNascimento(request.dataNascimento());
        novoFuncionario.setSenha(request.senha()); // Salvando a senha como texto puro, como combinado.

        // 4. Salva o novo funcionário no banco de dados.
        var funcionarioSalvo = usuarioRepository.save(novoFuncionario);
        return funcionarioSalvo.getIdUsuario();
    }
}