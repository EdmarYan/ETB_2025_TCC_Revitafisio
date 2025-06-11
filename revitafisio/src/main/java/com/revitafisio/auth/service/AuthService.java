package com.revitafisio.auth.service;

import com.revitafisio.auth.dto.AuthRequest;
import com.revitafisio.auth.dto.AuthResponse;
import com.revitafisio.entities.usuarios.Paciente; // Importamos a classe Paciente para a verificação
import com.revitafisio.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    // Construtor para injeção de dependência do repositório
    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public AuthResponse autenticar(AuthRequest request) {
        // 1. Busca o usuário pelo CPF no banco de dados
        var usuario = usuarioRepository.findByCpf(request.cpf())
                .orElseThrow(() -> new RuntimeException("CPF ou Senha inválidos."));

        // 2. Compara a senha (em texto puro, como combinado).
        // Adicionada uma verificação para evitar o NullPointerException.
        if (request.senha() == null || !request.senha().equals(usuario.getSenha())) {
            throw new RuntimeException("CPF ou Senha inválidos.");
        }

        // 3. APLICAÇÃO DA NOVA REGRA DE NEGÓCIO
        // Verificamos se o objeto 'usuario' é uma instância da classe 'Paciente'.
        if (usuario instanceof Paciente) {
            throw new RuntimeException("Acesso negado: Pacientes não podem fazer login no sistema.");
        }

        // 4. Se não for paciente e a senha estiver correta, o login prossegue.
        // Pega o nome da classe concreta (Fisioterapeuta, Admin, etc.)
        String tipoUsuario = usuario.getClass().getSimpleName().toUpperCase();

        // 5. Retorna a resposta de sucesso para o front-end
        return new AuthResponse(usuario.getIdUsuario(), usuario.getNome(), tipoUsuario);
    }
}