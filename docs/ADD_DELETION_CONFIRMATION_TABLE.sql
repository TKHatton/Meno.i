-- Create table for storing account deletion confirmation codes
-- This table stores temporary confirmation codes sent via email for account deletion

CREATE TABLE IF NOT EXISTS public.deletion_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confirmation_code VARCHAR(6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  used BOOLEAN NOT NULL DEFAULT FALSE,

  -- Ensure user can only have one active confirmation at a time
  CONSTRAINT unique_active_confirmation UNIQUE (user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deletion_confirmations_user_id
  ON public.deletion_confirmations(user_id);

CREATE INDEX IF NOT EXISTS idx_deletion_confirmations_code
  ON public.deletion_confirmations(confirmation_code);

-- Enable RLS
ALTER TABLE public.deletion_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own confirmation codes
CREATE POLICY "Users can view own deletion confirmations"
  ON public.deletion_confirmations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (backend will use service role)
CREATE POLICY "Service role can insert deletion confirmations"
  ON public.deletion_confirmations
  FOR INSERT
  WITH CHECK (true);

-- Service role can update (to mark as used)
CREATE POLICY "Service role can update deletion confirmations"
  ON public.deletion_confirmations
  FOR UPDATE
  USING (true);

-- Function to clean up expired confirmation codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_deletion_confirmations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.deletion_confirmations
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$;

COMMENT ON TABLE public.deletion_confirmations IS 'Stores temporary confirmation codes for account deletion';
COMMENT ON COLUMN public.deletion_confirmations.confirmation_code IS '6-digit confirmation code sent via email';
COMMENT ON COLUMN public.deletion_confirmations.expires_at IS 'Confirmation code expires after 15 minutes';
