import { useUI, type Subject } from '../lib/ui';
import { useGenerated } from '../lib/generated';
import { useStudyMap, type OpenNode } from '../lib/studymap';
import type { CalTask } from '../lib/calendar';

/** Resolve a taxonomy node id to what the NodeDetail view needs (label, topic/subtopic). */
export function resolveNode(subject: Subject, id: string): OpenNode {
  const tree = useStudyMap.getState().trees[subject];
  const topic = tree?.find((t) => t.id === id);
  if (topic) return { subject, id, label: topic.label, isTopic: true, subIds: topic.subs.map((x) => x.id) };
  const sub = tree?.flatMap((t) => t.subs).find((x) => x.id === id);
  return { subject, id, label: sub?.label ?? id, isTopic: false, subIds: [] };
}

/** Run a study-calendar task from anywhere (the calendar or the whiteboard side menu):
 *  a node task opens that node's detail (study sheet + practice); a mixed quiz/mock task
 *  loads its topics into the generator and opens it on the board. */
export function runTask(task: CalTask): void {
  const ui = useUI.getState();
  ui.setSubject(task.subject);
  if (task.nodeId) {
    useStudyMap.getState().setOpenNode(resolveNode(task.subject, task.nodeId));
    return;
  }
  const trees = useStudyMap.getState().trees;
  const ids = task.topicIds?.length
    ? task.topicIds
    : (trees[task.subject] ?? []).flatMap((t) => t.subs.map((x) => x.id));
  useGenerated.getState().setSelected(task.subject, ids);
  ui.setMode('board');
  ui.openPanel('generate');
}
