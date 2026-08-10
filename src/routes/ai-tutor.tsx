import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ai-tutor')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ai-tutor"!</div>
}
