// Decides what comes next: intro cutscenes, levels, outro cutscenes, the end.
import { LEVELS } from '../levels/levels.js';

/** The step that starts level `index`, including its intro cutscene. */
export function levelStep(index) {
  if (index >= LEVELS.length) return { scene: 'Credits', data: {} };
  const lvl = LEVELS[index];
  const play = { scene: 'Game', data: { index } };
  return lvl.intro ? { scene: 'Cutscene', data: { id: lvl.intro, next: play } } : play;
}

/** The step after finishing level `index`: its outro, then the next level. */
export function afterLevelStep(index) {
  const next = levelStep(index + 1);
  const lvl = LEVELS[index];
  return lvl.outro ? { scene: 'Cutscene', data: { id: lvl.outro, next } } : next;
}

export function go(scene, step) {
  scene.scene.start(step.scene, step.data);
}
