-- 1) active environment count by status
select status, count(*) as total
from environments
where destroyed_at is null
group by status
order by total desc;

-- 2) average deploy time to healthy
select avg(extract(epoch from (healthy_at - created_at)))::int as avg_seconds_to_healthy
from environments
where healthy_at is not null;

-- 3) rollback frequency by day
select date_trunc('day', created_at) as day, count(*) as rollbacks
from environment_revisions
where source = 'rollback'
group by 1
order by 1 desc
limit 14;

-- 4) top recent failure signatures
select metadata->>'cause' as cause, count(*) as occurrences
from environment_events
where event_type = 'failed'
group by 1
order by occurrences desc;

-- 5) resource saturation environments (latest sample > 80%)
select e.env_key, r.cpu_percent, r.ram_percent, r.sampled_at
from environments e
join lateral (
  select rs.cpu_percent, rs.ram_percent, rs.sampled_at
  from resource_samples rs
  where rs.environment_id = e.id
  order by rs.sampled_at desc
  limit 1
) r on true
where r.cpu_percent > 80 or r.ram_percent > 80
order by greatest(r.cpu_percent, r.ram_percent) desc;
