import { notFound } from 'next/navigation';

export default function TestNotFound() {
  // Langsung trigger 404
  notFound();
}
