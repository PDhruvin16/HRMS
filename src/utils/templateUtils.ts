export const convertVariablesToValue = (body: string, variables: string[] = []): string => {
  if (!body) return '';
  const matches = body.match(/{{(\d+)}}/g);
  if (!matches) return body;

  const numbers = matches.map((m) => {
    const numMatch = m.match(/\d+/);
    return numMatch ? Number(numMatch[0]) : 0;
  });
  const minIndex = Math.min(...numbers);

  return body.replace(/{{(\d+)}}/g, (_, index) => {
    const shiftedIndex = Number(index) - minIndex;
    return variables[shiftedIndex] ?? '';
  });
};
