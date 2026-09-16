import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Usage: @Roles('ADMIN', 'TUTOR') above a controller method.
// A user may hold multiple roles simultaneously (see UserRole table),
// so this checks "does the user have ANY of these roles", not equality.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
