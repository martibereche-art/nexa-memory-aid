import { createFileRoute } from "@tanstack/react-router";
import { ChecklistDetail } from "@/components/app/ChecklistDetail";

export const Route = createFileRoute("/app/packing/$listId")({
  component: () => {
    const { listId } = Route.useParams();
    return <ChecklistDetail kind="packing" listId={listId} />;
  },
});
