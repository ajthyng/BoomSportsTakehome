import fastify from 'fastify'

const app = fastify({ logger: true })

app.get('/', async (request, reply) => {
  return reply.code(200).send()
})

const bootstrap = async () => {
  try {
    await app.listen(3000, '0.0.0.0')
  } catch (err) {
    app.log.error(err)
  }
}

bootstrap()
