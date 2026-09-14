import { createFileRoute } from "@tanstack/react-router";
import { ChecklistDetail } from "@/components/app/ChecklistDetail";

export const Route = createFileRoute("/app/shopping/$listId")({
  component: () => {
    const { listId } = Route.useParams();
    return <ChecklistDetail kind="shopping" listId={listId} />;
  },
});
