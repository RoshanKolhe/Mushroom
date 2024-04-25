export function generateUniqueId(): string {
  const length = 8; // Length of the ID
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Characters to include in the ID
  let id = '';

  // Generate random bytes and map them to the charset
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    id += charset[randomIndex];
  }

  return id;
}
