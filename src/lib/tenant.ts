interface TenantUser {
  role: string;
  enterpriseId: string;
}

// Só o MASTER pode agir em outra empresa. Para os demais, vale sempre a empresa do token.
export function resolveEnterpriseId(user: TenantUser, requested: unknown): string {
  if (user.role === 'MASTER' && typeof requested === 'string' && requested) {
    return requested;
  }

  return user.enterpriseId;
}
