-- Create the newsletter_campaigns table
create type newsletter_campaign_status as enum ('draft', 'scheduled', 'sending', 'sent', 'failed');

create table newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subject text not null,
  content text not null, -- HTML content
  status newsletter_campaign_status not null default 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  sent_count int not null default 0,
  open_count int not null default 0,
  click_count int not null default 0,
  error text,
  metadata jsonb
);

-- Indexes for querying
create index idx_newsletter_campaigns_status on newsletter_campaigns(status);
create index idx_newsletter_campaigns_scheduled_for on newsletter_campaigns(scheduled_for);
create index idx_newsletter_campaigns_sent_at on newsletter_campaigns(sent_at);

-- Enable RLS
alter table newsletter_campaigns enable row level security;

-- Policies
-- Only admins can insert/update/delete
create policy "Admins can manage campaigns" on newsletter_campaigns
  for all
  using (auth.role() = 'admin');

-- All users can select (for future public campaign archives)
create policy "Anyone can view campaigns" on newsletter_campaigns
  for select
  using (true); 