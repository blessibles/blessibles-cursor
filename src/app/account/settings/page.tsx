import AccountSidebar from '@/components/AccountSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AccountSettingsPage() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreferences() {
      setLoading(true);
      setError(null);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) throw new Error('Not logged in');
        const { data, error: fetchError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        if (data) {
          setOrderUpdates(data.order_updates);
          setMarketingEmails(data.marketing_emails);
        }
      } catch (err: any) {
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    }
    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not logged in');
      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          order_updates: orderUpdates,
          marketing_emails: marketingEmails,
          updated_at: new Date().toISOString(),
        });
      if (upsertError) throw upsertError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4 w-full">
          <AccountSidebar />
        </div>
        <div className="flex-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 py-8 text-center text-lg">Settings coming soon.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Email Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-gray-500 py-8 text-center">Loading preferences…</div>
              ) : (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="order-updates" className="font-medium text-blue-900">Order Updates</label>
                    <input
                      id="order-updates"
                      type="checkbox"
                      checked={orderUpdates}
                      onChange={e => setOrderUpdates(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="marketing-emails" className="font-medium text-blue-900">Marketing Emails</label>
                    <input
                      id="marketing-emails"
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={e => setMarketingEmails(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                  {success && <div className="text-green-700 text-center font-semibold mt-2">Preferences saved!</div>}
                  {error && <div className="text-red-700 text-center font-semibold mt-2">{error}</div>}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 