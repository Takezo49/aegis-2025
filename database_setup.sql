-- ============================================================================
-- CyberCTF / Aegis 2025 - Primary Database Setup Script
-- Run this script in the Supabase SQL editor (or psql) to provision every table,
-- function, policy, and seed that the current Next.js application expects.
-- ============================================================================

BEGIN;

-- 0. Extensions & utilities --------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 1. Core tables -------------------------------------------------------------

-- 1.1 Admins (used by /admin/login)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_admins_updated_at ON public.admins;
CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.2 Players (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  player_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT players_user_fk FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_players_updated_at ON public.players;
CREATE TRIGGER trg_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.3 Profiles (optional public profile record referenced in auth callback flow)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_id_fk FOREIGN KEY (id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.4 Machines (list of vulnerable targets shown in dashboard)
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy','medium','hard','insane')),
  category TEXT,
  description TEXT,
  user_points INTEGER NOT NULL DEFAULT 100,
  root_points INTEGER NOT NULL DEFAULT 200,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_machines_updated_at ON public.machines;
CREATE TRIGGER trg_machines_updated_at
  BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.5 Flags (ground-truth values per machine)
CREATE TABLE IF NOT EXISTS public.flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL
    REFERENCES public.machines (id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL
    CHECK (flag_type IN ('user','root','challenge')),
  flag_text TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (machine_id, flag_type)
);

DROP TRIGGER IF EXISTS trg_flags_updated_at ON public.flags;
CREATE TRIGGER trg_flags_updated_at
  BEFORE UPDATE ON public.flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1.6 User flag submissions (tracks per-player captures)
CREATE TABLE IF NOT EXISTS public.user_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL
    REFERENCES public.players (id) ON DELETE CASCADE,
  machine_id UUID NOT NULL
    REFERENCES public.machines (id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL
    CHECK (flag_type IN ('user','root','challenge')),
  flag_value TEXT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, machine_id, flag_type)
);

-- 1.7 Site IP configuration (editable from admin panel)
CREATE TABLE IF NOT EXISTS public.site_ip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_site_ip_updated_at ON public.site_ip;
CREATE TRIGGER trg_site_ip_updated_at
  BEFORE UPDATE ON public.site_ip
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Indexes -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_score ON public.players(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_flags_player ON public.user_flags(player_id);
CREATE INDEX IF NOT EXISTS idx_user_flags_machine ON public.user_flags(machine_id);
CREATE INDEX IF NOT EXISTS idx_flags_machine_type ON public.flags(machine_id, flag_type);
CREATE INDEX IF NOT EXISTS idx_machines_slug ON public.machines(slug);

-- 3. Grants ------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admins TO anon; -- admin login uses anon key
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.machines TO anon, authenticated;
GRANT SELECT ON public.flags TO authenticated;
GRANT SELECT, INSERT ON public.user_flags TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.site_ip TO anon; -- admin dashboard uses anon key

-- 4. Row Level Security ------------------------------------------------------

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_ip DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Players
DROP POLICY IF EXISTS "players_select" ON public.players;
CREATE POLICY "players_select" ON public.players
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "players_self_manage" ON public.players;
CREATE POLICY "players_self_manage" ON public.players
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_manage" ON public.profiles;
CREATE POLICY "profiles_self_manage" ON public.profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Machines (read-only to authenticated clients, managed via service role)
DROP POLICY IF EXISTS "machines_select" ON public.machines;
CREATE POLICY "machines_select" ON public.machines
  FOR SELECT USING (auth.role() = 'authenticated');

-- Flags (needed for client-side validation in current app)
DROP POLICY IF EXISTS "flags_select" ON public.flags;
CREATE POLICY "flags_select" ON public.flags
  FOR SELECT USING (auth.role() = 'authenticated');

-- User Flags
DROP POLICY IF EXISTS "user_flags_select" ON public.user_flags;
CREATE POLICY "user_flags_select" ON public.user_flags
  FOR SELECT USING (auth.uid() = (
    SELECT user_id FROM public.players WHERE id = player_id
  ));

DROP POLICY IF EXISTS "user_flags_insert" ON public.user_flags;
CREATE POLICY "user_flags_insert" ON public.user_flags
  FOR INSERT WITH CHECK (auth.uid() = (
    SELECT user_id FROM public.players WHERE id = player_id
  ));

-- 5. Stored procedures -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.submit_flag(p_player_id UUID, p_flag TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flag flags%ROWTYPE;
  v_player players%ROWTYPE;
  v_points INTEGER;
BEGIN
  IF p_player_id IS NULL OR p_flag IS NULL OR LENGTH(TRIM(p_flag)) = 0 THEN
    RETURN 'invalid_payload';
  END IF;

  SELECT * INTO v_player FROM public.players WHERE id = p_player_id;
  IF NOT FOUND THEN
    RETURN 'unknown_player';
  END IF;

  SELECT * INTO v_flag FROM public.flags
   WHERE flag_text = TRIM(p_flag)
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN 'invalid_flag';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_flags
     WHERE player_id = p_player_id
       AND machine_id = v_flag.machine_id
       AND flag_type = v_flag.flag_type
  ) THEN
    RETURN 'already_captured';
  END IF;

  INSERT INTO public.user_flags (player_id, machine_id, flag_type, flag_value, points_awarded)
  VALUES (p_player_id, v_flag.machine_id, v_flag.flag_type, TRIM(p_flag), v_flag.points);

  UPDATE public.players
     SET score = score + COALESCE(v_flag.points, 0),
         updated_at = NOW()
   WHERE id = p_player_id;

  RETURN 'flag_accepted';
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_flag(UUID, TEXT) TO authenticated;

-- 6. Seed data ---------------------------------------------------------------
INSERT INTO public.admins (username, password_hash, email)
VALUES ('admin', 'admin123', 'admin@ctf.local')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.site_ip (ip_address)
VALUES ('192.168.1.1')
ON CONFLICT (ip_address) DO NOTHING;

INSERT INTO public.machines (name, slug, difficulty, category, description, user_points, root_points)
VALUES
  ('Recon Rover', 'recon-rover', 'easy', 'Recon', 'Intro box that teaches enumeration basics.', 100, 150),
  ('Cipher Core', 'cipher-core', 'medium', 'Crypto', 'Mid-tier crypto challenge with two flags.', 150, 250)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.flags (machine_id, flag_type, flag_text, points)
SELECT m.id, data.flag_type, data.flag_text, data.points
FROM public.machines m
JOIN (
  VALUES
    ('recon-rover', 'user', 'cyberctf{recon_user_flag}', 100),
    ('recon-rover', 'root', 'cyberctf{recon_root_flag}', 150),
    ('cipher-core', 'user', 'cyberctf{cipher_user_flag}', 150),
    ('cipher-core', 'root', 'cyberctf{cipher_root_flag}', 250)
) AS data(slug, flag_type, flag_text, points)
  ON m.slug = data.slug
ON CONFLICT (machine_id, flag_type) DO NOTHING;

COMMIT;
