export type Problem = {
  question: string;
  answer: number;
  options: number[];
};

export const generateProblem = (level: number): Problem => {
  const range = 5 + level * 5;
  const a = Math.floor(Math.random() * range) + 1;
  const b = Math.floor(Math.random() * range) + 1;
  const isSubtraction = level > 2 && Math.random() > 0.5;
  
  let question, answer;
  if (isSubtraction) {
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    question = `${max} - ${min}`;
    answer = max - min;
  } else {
    question = `${a} + ${b}`;
    answer = a + b;
  }

  const options = [answer];
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 6) - 3;
    const wrong = answer + offset;
    if (wrong !== answer && wrong > 0 && !options.includes(wrong)) {
      options.push(wrong);
    }
  }

  return {
    question,
    answer,
    options: options.sort(() => Math.random() - 0.5),
  };
};
