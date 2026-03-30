import { redirect } from 'next/navigation'

// TEMP: auth bypass for local UI preview
export default async function RootPage() {
  redirect('/dashboard')
}
