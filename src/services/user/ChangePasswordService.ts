import { compare, hash } from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';

interface ChangePasswordRequest {
  id: string;
  currentPassword: string;
  newPassword: string;
}

const MIN_PASSWORD_LENGTH = 8;

class ChangePasswordService {
  async execute({ id, currentPassword, newPassword }: ChangePasswordRequest) {
    if (!currentPassword || !newPassword) {
      throw new Error("Informe a senha atual e a nova senha.");
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

    const user = await prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const passwordMatch = await compare(currentPassword, user.password);

    if (!passwordMatch) {
      throw new Error("A senha atual está incorreta.");
    }

    await prisma.user.update({
      where: { id },
      data: { password: await hash(newPassword, 8) }
    });

    return { message: "Senha alterada com sucesso." };
  }
}

export { ChangePasswordService };
