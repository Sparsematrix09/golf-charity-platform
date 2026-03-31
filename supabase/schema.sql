-- Users Profiles
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text,
  role text DEFAULT 'user'::text,
  stripe_customer_id text,
  subscription_status text,
  charity_id uuid,
  charity_pct integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions 
CREATE TABLE public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL,
  status text NOT NULL,
  renewal_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Golf Scores (Stableford, 1-45, max 5 rolling per user handled in app logic)
CREATE TABLE public.golf_scores (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 45),
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Charities
CREATE TABLE public.charities (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  emoji text,
  events text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Independent Donations
CREATE TABLE public.donations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  charity_id uuid REFERENCES public.charities(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text DEFAULT 'independent'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Draws (Monthly Engine)
CREATE TABLE public.draws (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  month text NOT NULL,
  status text DEFAULT 'draft'::text CHECK (status IN ('draft', 'simulated', 'published')),
  logic text DEFAULT 'random'::text,
  pool_total numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Draw Numbers (The 5 winning numbers per draw)
CREATE TABLE public.draw_numbers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id uuid REFERENCES public.draws(id) ON DELETE CASCADE,
  number integer NOT NULL CHECK (number >= 1 AND number <= 45)
);

-- Draw Entries (Snapshot of user scores at draw time)
CREATE TABLE public.draw_entries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id uuid REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  scores integer[] NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(draw_id, user_id)
);

-- Draw Results (Winnings)
CREATE TABLE public.draw_results (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id uuid REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_type integer NOT NULL CHECK (match_type IN (3, 4, 5)),
  prize_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Winner Verifications
CREATE TABLE public.winner_verifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_result_id uuid REFERENCES public.draw_results(id) ON DELETE CASCADE UNIQUE,
  proof_url text NOT NULL,
  status text DEFAULT 'pending'::text,
  payout_status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Global Jackpot Counter
CREATE TABLE public.jackpot (
  id integer PRIMARY KEY DEFAULT 1,
  current_amount numeric DEFAULT 0,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
INSERT INTO public.jackpot (id, current_amount) VALUES (1, 4200.00);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Setup RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_verifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow users to read own data
CREATE POLICY "Users view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own scores" ON public.golf_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores" ON public.golf_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scores" ON public.golf_scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own draw entries" ON public.draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own draw results" ON public.draw_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own verifications" ON public.winner_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert verifications" ON public.winner_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can do everything (Bypass RLS handled by supabase logic or specific policies if needed, 
-- but normally done via Service Role Key for backend or specific admin flag for frontend rows)
-- For frontend admin check:
CREATE POLICY "Admins full access profiles" ON public.profiles USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access charities" ON public.charities USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access draws" ON public.draws USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access verifications" ON public.winner_verifications USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Public access policies
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read charities" ON public.charities FOR SELECT USING (true);
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read draws" ON public.draws FOR SELECT USING (true);
ALTER TABLE public.jackpot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read jackpot" ON public.jackpot FOR SELECT USING (true);
