# Boom Sports Take Home Assignment

## Running
Run the command `docker-compose up --build` to run the project. You should have docker and docker-compose installed on the machine you intend to run on.

To run tests you will need to do a full `npm install`. You can run the tests with `npm test -- --coverage`.

Additionally, if you'd prefer not to have docker installed at all you can run the project as-is with the same command used in the Dockerfile.dev: `npm run nodemon`.

Please not that this is not a suitable Dockerfile to build a production image, which is why I added the `.dev` extension onto it. 

## In Memory Caches
I've implemented a couple caches in this to avoid hammering the ESPN API. One of the caches, `InMemoryCache.ts`, is a basic object wrapped in a class. I added a TTL feature but I don't really use it except in tests. 

The other type of 'cache' is a general purpose memoization function. Sometimes its expensive to do a sort or a reduce on a reasonably sized set of data. I use this function to exchange cpu cycles for memory. 

I'd like to iterate that I would not use an in-memory cache in production. I would rely on a service like memcached or Redis to handle that task for me. 

## Logging
There's a logging class there. I'm not logging to anywhere but the console. However, if I needed to I'd only have to provide a new Logger class. 