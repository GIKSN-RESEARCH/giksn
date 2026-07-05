import type { Paper } from "@/lib/papers";
import { PaperRow } from "@/components/PaperRow";

type Props = {
  update: Paper;
  index?: number;
};

export function UpdateRow({ update, index }: Props) {
  return <PaperRow paper={update} index={index} />;
}