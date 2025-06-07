-- Table to log open/click events for newsletter campaigns
create table newsletter_campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references newsletter_campaigns(id) on delete cascade,
  subscriber_email text not null,
  event_type text not null check (event_type in ('open', 'click')),
  url text,
  created_at timestamptz not null default now()
);

create index idx_campaign_events_campaign_id on newsletter_campaign_events(campaign_id);
create index idx_campaign_events_event_type on newsletter_campaign_events(event_type);
create index idx_campaign_events_url on newsletter_campaign_events(url);

alter table newsletter_campaign_events enable row level security;

-- Only admins can insert/select/delete
create policy "Admins can manage campaign events" on newsletter_campaign_events
  for all
  using (auth.role() = 'admin'); 