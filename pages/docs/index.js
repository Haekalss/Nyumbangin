export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/docs/index.html',
      permanent: false
    }
  }
}

export default function Docs() {
  return null
}
