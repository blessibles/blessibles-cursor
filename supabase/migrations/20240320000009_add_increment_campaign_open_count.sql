-- Function to increment open_count for a campaign
create or replace function increment_campaign_open_count(campaign_id uuid)
returns void as $$
begin
  update newsletter_campaigns
  set open_count = coalesce(open_count, 0) + 1
  where id = campaign_id;
end;
$$ language plpgsql security definer; 