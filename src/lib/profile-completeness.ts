export function computeProfileCompleteness(input: {
  hasAcademic: boolean;
  academicFieldsFilled: number;
  skillsCount: number;
  experiencesCount: number;
  interestsCount: number;
}): number {
  let score = 0;
  score += Math.min(input.academicFieldsFilled / 4, 1) * 25;
  score += Math.min(input.skillsCount / 6, 1) * 35;
  score += Math.min(input.experiencesCount / 2, 1) * 20;
  score += Math.min(input.interestsCount / 3, 1) * 20;
  return Math.round(score);
}