-- Function to increment click_count for a campaign
create or replace function increment_campaign_click_count(campaign_id uuid)
returns void as $$
begin
  update newsletter_campaigns
  set click_count = coalesce(click_count, 0) + 1
  where id = campaign_id;
end;
$$ language plpgsql security definer; 