'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Settings, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export type AuthStatusPaths = {
  login?: string;
  logout?: string;
  register?: string;
  profile?: string;
  settings?: string;
  account?: string;
  dashboard?: string;
};

export interface AuthStatusProps {
  paths?: AuthStatusPaths;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
}

export default function AuthStatus({ paths }: AuthStatusProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={paths?.login ?? '/auth/login'}>Iniciar sesión</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={paths?.register ?? '/auth/register'}>Registrarse</Link>
        </Button>
      </div>
    );
  }

  const user = session.user;
  const initials = getInitials(user.name, user.email);
  const displayName = user.name || user.email || 'Usuario';
  const profileHref = paths?.profile ?? '/profile';
  const settingsHref = paths?.settings ?? '/settings';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          aria-label="Abrir menú de usuario"
        >
          <Avatar className="h-8 w-8">
            {user.image ? (
              <AvatarImage src={user.image} alt={displayName} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          {user.email ? (
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={profileHref}
            className="cursor-pointer flex items-center"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={settingsHref}
            className="cursor-pointer flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
          onSelect={() => signOut({ callbackUrl: paths?.logout ?? '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
