export const generateParentalProblem = () => {
  const a = Math.floor(Math.random() * 12) + 5;
  const b = Math.floor(Math.random() * 5) + 3;
  return { question: `${a} × ${b}`, answer: a * b };
};
