import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>API Gestão Escolar</title>
      </Head>
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>API Gestão Escolar</h1>
        <p>Use o frontend em <a href="http://localhost:5173">http://localhost:5173</a>.</p>
        <p><a href="/api/health">/api/health</a> — verificar conexão</p>
      </div>
    </>
  )
}
