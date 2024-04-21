import { jwtDecode } from 'src/auth/context/jwt/utils';

export function useUserRoles() {
  let permissions; // Declare the permissions variable

  if (localStorage.getItem('accessToken')) {
    const userLoggedIn = localStorage.getItem('accessToken');
    ({ permissions } = jwtDecode(userLoggedIn)); // Assign the value to permissions
  }

  return permissions; // Remove the assignment in the return statement
}
