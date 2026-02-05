export const generateUniqueId = (existingIds: string[]): string => {
  let newId: string;
  do {
    newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  } while (existingIds.includes(newId));
  return newId;
};
