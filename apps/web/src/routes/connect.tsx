import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/connect")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(trpc.healthCheck.queryOptions());
  console.log(data);
  return <div>Hello "/connect"!</div>;
}
