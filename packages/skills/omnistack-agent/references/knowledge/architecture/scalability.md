# Scalability

> How a system absorbs more load without falling over — and why you should only build the scaling you can measure a need for.

## Concepts

- **Vertical scaling (scale up):** give one machine more CPU/RAM. Simple, no code changes, but
  hits a hard ceiling and a single point of failure.
- **Horizontal scaling (scale out):** add more machines behind a load balancer. Near-unbounded, but
  forces you to handle distribution, consistency, and coordination.
- **Statelessness:** keep no per-request state in the process. Push session/state into a shared store
  (Redis, DB, signed token) so any instance can serve any request — the prerequisite for scaling out.
- **Caching:** store the result of expensive work closer to the reader (in-process, distributed
  cache like Redis, CDN at the edge). The fastest query is the one you never run.
- **Load balancing:** spread requests across instances (round-robin, least-connections) with health
  checks so a dead node stops receiving traffic.
- **Database scaling:** read replicas for read-heavy loads; sharding (partition data by key) for
  write-heavy loads that outgrow one node.
- **Async & queues:** offload slow or bursty work (email, image processing) to a background worker via
  a message queue, so the request path stays fast and load smooths out under spikes.

## Best Practices

- **Scale only what you measure.** Profile, find the actual bottleneck, then scale that tier — don't
  guess. Most systems are bottlenecked in one place at a time.
- Make services stateless before you try to run more than one of them.
- Cache with an explicit invalidation strategy and a TTL; a stale cache is a correctness bug.
- Add read replicas before sharding; sharding is a large, hard-to-reverse commitment.
- Use queues to turn synchronous spikes into steady background throughput.
- Set autoscaling policies on a real signal (latency, queue depth), not just CPU.

## Patterns & Examples

```text
Client ──> Load Balancer ──> [ App #1 ] [ App #2 ] [ App #3 ]   (stateless, scale out)
                                  │            │
                                  ├──> Redis (shared cache + sessions)
                                  ├──> Primary DB ──(replication)──> Read Replica(s)
                                  └──> Message Queue ──> Background Workers (async jobs)
```

```text
Scale-the-bottleneck checklist:
1. Measure   — find the slow tier (latency, throughput, queue depth).
2. Cache     — can the work be avoided or memoized?
3. Out       — make it stateless, then add instances behind the LB.
4. Offload   — move slow/bursty work to a queue + workers.
5. Data      — read replicas, then (only if needed) shard.
```

## Common Pitfalls / Anti-patterns

- **Premature scaling:** building sharding and microservices for traffic you don't have yet. Pay the
  complexity tax when the load is real, not before.
- **Distributed monolith:** services split across the network but so tightly coupled they must deploy
  together — you bought all the latency of distribution and none of the independence.
- **Sticky sessions hiding state:** pinning users to one instance to dodge real statelessness; it
  breaks the moment that instance dies or you need to rebalance.
- **Cache as a crutch:** caching to mask an unindexed query or N+1 instead of fixing the root cause.

## References

- AWS Well-Architected Framework — Performance Efficiency & Reliability pillars — https://docs.aws.amazon.com/wellarchitected/latest/framework/
- Google SRE Book — https://sre.google/books/
- Newman, *Building Microservices* (2nd ed.) — distribution trade-offs

<!-- level: intermediate -->
