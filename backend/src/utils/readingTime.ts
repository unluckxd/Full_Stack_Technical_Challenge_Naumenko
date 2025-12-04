const WORDS_PER_MINUTE = 220;

export const calculateReadingTime = (content: string): number => {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};
