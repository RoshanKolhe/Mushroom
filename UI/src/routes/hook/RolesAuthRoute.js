/* eslint-disable react/prop-types */
import { Fragment } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from 'src/auth/hooks';

export function RolesAuthRoute({ children, roles }) {
  const { user } = useAuthContext();
  const userRoles = user.permissions;
  const canAccess = userRoles.some((userRole) => roles.includes(userRole));

  if (canAccess) return <>{children}</>;

  return <Navigate to="/404" replace/>;
}
