import fs from 'fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = fs.readFileSync('src/viewModels/useMainTabViewModel.js', 'utf8');

for (const token of [
  'TOP_STORY_STALE_HOURS = 24',
  'TOP_STORY_FRESH_HOURS = 12',
  'function getStoryAgeMs',
  'function topStoryRankScore',
  'STALE_STORY_SCORE_PENALTY',
  'const sorted = [...stories].sort',
]) {
  assert(source.includes(token), `Missing required recency token: ${token}`);
}

assert(
  !source.includes('if (!customSortTopStories) return stories;'),
  'Top Stories must not return raw feed order when custom sorting is off'
);

console.log('PASS: Main tab top story recency ranking');
