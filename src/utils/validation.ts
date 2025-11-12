import { Teacher } from "@/types";

export const VALID_ROLES = ['admin', 'teacher', 'junior'] as const;
export type ValidRole = typeof VALID_ROLES[number];

export const ROLE_LABELS: Record<ValidRole, string> = {
  admin: 'Администратор',
  teacher: 'Учитель',
  junior: 'Младший научный сотрудник'
};

export function isValidRole(role: string): role is ValidRole {
  return VALID_ROLES.includes(role as ValidRole);
}

export function validateTeacher(teacher: Partial<Teacher>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!teacher.name || teacher.name.trim().length === 0) {
    errors.push('Имя учителя обязательно');
  }

  if (teacher.name && teacher.name.trim().length < 2) {
    errors.push('Имя учителя должно содержать минимум 2 символа');
  }

  if (!teacher.role) {
    errors.push('Роль учителя обязательна');
  } else if (!isValidRole(teacher.role)) {
    errors.push(`Недопустимая роль: "${teacher.role}". Разрешены только: ${VALID_ROLES.join(', ')}`);
  }

  if (teacher.email && teacher.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacher.email.trim())) {
      errors.push('Некорректный формат email');
    }
  }

  if (teacher.password && teacher.password.trim().length > 0 && teacher.password.trim().length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
