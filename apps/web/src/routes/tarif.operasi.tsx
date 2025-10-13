import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tarif/operasi')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tarif/operasi"!</div>
}
