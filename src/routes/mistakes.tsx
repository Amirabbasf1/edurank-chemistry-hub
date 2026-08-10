import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mistakes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mistakes"!</div>
}
